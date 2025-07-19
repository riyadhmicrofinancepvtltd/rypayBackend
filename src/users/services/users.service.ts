import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IAccessTokenUserPayload } from 'src/auth/interfaces/user-token-request-payload.interface';
import { TokenService } from 'src/auth/services/token.service';
import { CardsService } from 'src/cards/services/cards.service';
import { CardStatus } from 'src/core/entities/card.entity';
import { UserDocument } from 'src/core/entities/document.entity';
import { User } from 'src/core/entities/user.entity';
import { VirtualAccount } from 'src/core/entities/virtual-account.entity'
import { Wallet } from 'src/core/entities/wallet.entity';
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';
import { UserRole } from 'src/core/enum/user-role.enum';
import { generateRef } from 'src/core/utils/hash.util';
import { MerchantClientService } from 'src/integration/busybox/external-system-client/merchant-client.service';
import { OtpRepository } from 'src/notifications/repository/otp.repository';
import { OtpFlowService } from 'src/notifications/services/otp-flow.service';
import { WalletBridge } from 'src/wallet/services/wallet.queue';
import { WalletService } from 'src/wallet/services/wallet.service';
import { DataSource, EntityManager, ILike, Not, QueryRunner, Repository } from 'typeorm';
import { KycRequiredDocTypes } from '../constants/kyc-required-doc-types.constant';
import { PhoneNumberExists } from '../dto/phone-number-exists.dto';
import { UserDocumentResponseDto } from '../dto/user-documents.dto';
import { UpdateKycDetailUploadDto } from '../dto/user-kyc-upload.dto';
import { UserAdminRequestDto, UserRequestDto, UserUpdateRequestDto } from '../dto/user-request.dto';
import { UserApiResponseDto, UserResponse } from '../dto/user-response.dto';
import { UserMapper } from '../mapper/user-mapper';
import { UploadFileService } from './updaload-file.service';
import { RechargeClientService } from 'src/integration/a1topup/external-system-client/recharge/recharge-client.service';
import { ValidateAadharDto } from '../dto/validate-aadhar.dto';
import { AadharResponse } from 'src/core/entities/aadhar-verification.entity';
import { NotificationBridge } from 'src/notifications/services/notification-bridge';
import { StaticQRDTO } from '../dto/static-qr.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;
  constructor(
    private tokenService: TokenService,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private walletService: WalletService,
    private merchantClientService: MerchantClientService,
    private cardService: CardsService,
    private _connection: DataSource,
    private uploadFileService: UploadFileService,
    private otpFlowService: OtpFlowService,
    private otpRepository: OtpRepository,
    private rechargeClient: RechargeClientService,
    private readonly walletBridge: WalletBridge,
    private readonly notificationBridge: NotificationBridge,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(VirtualAccount) private virtualAccountRepo: Repository<VirtualAccount>,
    @InjectRepository(AadharResponse) private aadharResponseRepo: Repository<AadharResponse>,
    @InjectRepository(UserDocument) private documentRepository: Repository<UserDocument>,
  ) { }

  async registerUser(userRequestDto: UserRequestDto) {
    console.log(userRequestDto);
    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = UserMapper.mapUserRequestDtoToEntity(userRequestDto);

      const userExists = await this.userRepository.findOne({
        where: {
          phoneNumber: userRequestDto.phoneNumber,
        }
      });

      const referrer = await this.validateRefferelCode(userRequestDto.referrelCode, queryRunner);

      if (userExists) {
        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        throw new ConflictException('User already exists');
      }

      const savedUser = this.userRepository.create(newUser);

      if (!savedUser) {
        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        throw new BadRequestException('User cannot be created');
      }

      await queryRunner.manager.save(savedUser);

      const wallet: Wallet = await this.walletService.createWallet(
        {
          user: savedUser,
          walletAccountNo: await this.walletService.generateWalletAccountNo()
        },
        queryRunner,
      );
      const cardInfo = await this.merchantClientService.getCustomerStatus(savedUser.phoneNumber);
      const cardDetails = cardInfo.data.card_details;
      const cardDto = {
        user: savedUser,
        cardNumber: cardDetails.cardId,
        status: CardStatus.InActive
      };
      const card = await this.cardService.createCardAndAssignKitNumberToUser(cardDto, queryRunner);

      if (!wallet || !card) {
        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        throw new BadRequestException('Wallet creation failed');
      }

      // const user = await this.userRepository.save(newUser);
      await queryRunner.commitTransaction();
      await this.notificationBridge.add('newUser', savedUser);
      const userModel = { ...savedUser, card: card };

      if (referrer) {
        await this.walletBridge.add('referrel', {
          referrer: referrer.id,
          refree: savedUser.id
        })
      }
      return this.addProfileIconInUserResponse(savedUser, new UserResponse(userModel));
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async validateRefferelCode(referrelCode: string | null, queryRunner: QueryRunner) {
    let referrer: User = null;
    if (referrelCode) {
      referrer = await this.userRepository.findOneBy({ referralCode: referrelCode });
      if (!referrer) {
        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        throw new BadRequestException('Invalid Referral code');
      }
    }
    return referrer;
  }

  async deleteUser(
    userId: string,
  ): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new ForbiddenException('user does not have enough permissions')
    }
    user.isBlocked = true;
    await this.userRepository.save(user);
    return "Success";
  }
  async getUserDetail(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['beneficiaries', 'card', 'address'],
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const account = user.beneficiaries?.[0]; // or filter for a "primary" one

    const accountDetails = account ? {
      accountNumber: account.bankAccountNumber,
      ifscCode: account.ifscCode,
      nameInBank: account.nameInBank,
      //upi: account.upi
    } : null;

    return {
      success: true,
      message: 'Fetched User Data',
      user: {
        userid: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        userRole: user.role,
        address: user.address ? {
          address1: user.address.address1,
          address2: user.address.address2,
          city: user.address.city,
          state: user.address.state,
          pincode: user.address.pincode,
          id: user.address.id,
          createdAt: user.address.createdAt,
        } : null,
        aadharNumber: user.aadharNumber,
        panNumber: user.panNumber,
        isBlocked: user.isBlocked,
        phoneNumber: user.phoneNumber,
        merchantPartnerId: user.merchantPartnerId,
        kycVerificationStatus: user.kycVerificationStatus === 0 ? "NOT_INITIATED" : "VERIFIED", // adjust as per enum
        isPinCreated: !!user.pin,
        cardDetails: user.card ? {
          cardId: user.card.cardNumber,
          status: user.card.status,
          lastFourDigit: user.card.lastFourDigits
        } : null,
        accountDetails: accountDetails,
        referrelCode: user.referralCode
      }
    };
  }



  async registerUserAndGenerateToken(
    userRequestDto: UserRequestDto,
  ): Promise<UserApiResponseDto> {
    const orgId = this.configService.get('BUSY_BOX_ORG_ID');
    const issueCardDto = UserMapper.mapUserRequestDtoToMerchantRegistrationDto(userRequestDto, orgId);
    const userResponse = await this.merchantClientService.issueCard(issueCardDto);
    if (userResponse.status === "SUCCESS") {
      userRequestDto.cardHolderId = userResponse.data.cardHolderId;
      userRequestDto.userSession = userResponse.sessionId;
      const user = await this.registerUser(userRequestDto);
      const tokenPayload = <IAccessTokenUserPayload>{
        userId: user.userid,
        phoneNumber: user.phoneNumber,
        role: user.userRole,
      };
      const tokens = await this.tokenService.generateTokens(tokenPayload);
      return {
        success: true,
        message: "Fetched User Data",
        user,
        tokens,
      } as any;
    }
    throw new InternalServerErrorException("Failed to issue card for the user");
  }

  async requestAadharOtp(aadharNumber: string) {
    const data = await this.rechargeClient.requestAadharOtp(aadharNumber);
    if (data.status === "SUCCESS") {
      return {
        message: "Success",
        sessionId: data.aadhaarData?.otpSessionId
      };
    }
    return {
      message: "Failure",
      sessionId: null
    };
  }

  async validateAadharOtp(requestBody: ValidateAadharDto) {
    const response = await this.rechargeClient.validateAadharOtp(requestBody.aadharNumber, requestBody.otp, requestBody.otpSessionId);
    if (response.status === "SUCCESS" && response.transId === "OTP_VERIFIED") {
      await this.aadharResponseRepo.save(this.aadharResponseRepo.create({
        aadharNumber: requestBody.aadharNumber,
        aadharResponse: response
      }));
      return "Success";
    } else {
      return "Failure";
    }
  }

  async registerAdminAndGenerateToken(
    userRequestDto: UserAdminRequestDto,
  ): Promise<UserApiResponseDto> {
    userRequestDto.cardHolderId = `ADMIN_${generateRef(12)}`;
    const user = await this.registerUser(userRequestDto);
    const tokenPayload = <IAccessTokenUserPayload>{
      userId: user.userid,
      phoneNumber: user.phoneNumber,
      role: user.userRole,
    };
    const tokens = await this.tokenService.generateTokens(tokenPayload);
    return {
      user,
      tokens,
    };
  }

  async updateUserProfile(userId: string,
    userRequestDto: UserUpdateRequestDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['merchant', 'card', 'address', 'loans', 'documents', 'beneficiaries'] });
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const updatedUserEntity = UserMapper.mapUserUpdateRequestDtoToUserEntity(user, userRequestDto);
    await this.userRepository.save(updatedUserEntity);
    user.kycVerificationStatus = KycVerificationStatus[user.kycVerificationStatus] as any
    return user;
  }


  async checkPhoneNumberExists(phoneNumber: string) {
    if (!phoneNumber) {
      throw new BadRequestException('Invalid phone number')
    }
    const user = await this.userRepository.findOneBy({
      phoneNumber: phoneNumber
    });
    return <PhoneNumberExists>{
      isUserExist: !!user,
      userName: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phoneNumber
    }
  }

  async getAllUsers(userId: string, searchQuery: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('user not found')
    }
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('User does not have enough permissions');
    }
    const query = this.userRepository.createQueryBuilder('user');

    query.where('user.role != :adminRole', { adminRole: UserRole.ADMIN });

    if (searchQuery) {
      query.andWhere(
        `(
          CONCAT(COALESCE(user.firstName, ''), ' ', COALESCE(user.lastName, '')) ILIKE :search OR
          user.firstName ILIKE :search OR
          user.lastName ILIKE :search OR
          user.phoneNumber ILIKE :search
        )`,
        { search: `%${searchQuery}%` },
      );
    }

    const users = await query.getMany();
    return users.map(user => new UserResponse(user));
  }

  async addProfileIconInUserResponse(userModel: User, userResponse: UserResponse) {
    if (userModel.profileIcon) {
      const fileInfo = await this.uploadFileService.getPresignedSignedUrl(userModel.profileIcon);
      userResponse.profileUrl = fileInfo.url;
    }
    if (userModel.staticQR) {
      const fileInfo = await this.uploadFileService.getPresignedSignedUrl(userModel.staticQR);
      userResponse.staticQRUrl = fileInfo.url;
    }
    return userResponse;
  }

  async setPin(userId: string, pin: string): Promise<void> {
    const hashedPin = await bcrypt.hash(pin, this.saltRounds);
    await this.userRepository.update(userId, { pin: hashedPin });
  }

  // async createVirtualAccount(userId: string, customer_name: string,email: string,phoneNumber: string): Promise<void> {
  //   const busyBoxAPIURL = this.configService.get('BUSY_BOX_PAYOUT_API_BASE_URL');
  //   const accountId = Math.floor(10000000 + Math.random() * 90000000).toString();
  //   return {
  //     busyBoxAPIURL,
  //     accountId,
  //     customer_name,
  //     email,
  //     phoneNumber
  //   } as any

  //   //await this.userRepository.update(userId, { pin: hashedPin });
  // }
  async createVirtualAccount(
    userId: string,
    customer_name: string,
    email: string,
    phoneNumber: string
  ): Promise<any> {
    const accountId = Math.floor(10000000 + Math.random() * 90000000).toString();

    const busyBoxBaseUrl = this.configService.get('BUSY_BOX_PAYOUT_API_BASE_URL')
    const token = this.configService.get('BUSY_BOX_PAYOUT_API_TOKEN') || 'HnKFjVswJ8BhXRFzxf8pP6L1fDlhOrpzCs8S+VcGrl7xurg7iur3LfIsxCJE/ttiHm3cJbqxDKbj8fKxSeQIlcKZ/P/i7dnanAqyd1+O4FINU7n+W/QWg/ZBkfdZ0v+JqnnuGI2oXMOv7Z72WpzwnQ==';
    const url = `${busyBoxBaseUrl}/collect/va/create`;
    const payload = {
      customer_name,
      vaId: accountId,
      email,
      mobile: phoneNumber,
    };
    try {
      const virtualExist = await this.virtualAccountRepo.findOne({
        where: { number: phoneNumber, userid: userId },
      });
      if (virtualExist) {
        throw new BadRequestException({
          success: false,
          message: 'Virtual account already created for this number and user.',
        });
      }
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );
      let data = response.data;
      const newAccount = this.virtualAccountRepo.create({
        accountid: data.data.accountId,
        accountnumber: data.data.accountNumber,
        ifsccode: data.data.ifscCode,
        status: data.data.status || 'ACTIVE',
        userid: userId,
        number: phoneNumber
      });
      const saved = await this.virtualAccountRepo.save(newAccount);
      data["success"] = true
      return data
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          statusCode: 400,
          success: false,
          message: error.message,
        };
      }
      const errMessage = error.response?.data || error.message;
      console.error('Error creating virtual account:', errMessage);
      throw new InternalServerErrorException('Failed to create virtual account');
    }
  }
//getVirtualAccount
async getVirtualAccount(userId: string): Promise<any> {
  const user = await this.virtualAccountRepo.findOne({ where: { userid: userId } });
  console.log("user=====>", user)
  if (!user) {
    throw new UnauthorizedException('Virtual account not found');
  }
  return user
}

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return bcrypt.compare(pin, user.pin);
  }

  async validateUserCardAssignment(userId: string, otp: string) {
    const user = await this.findUserById(userId);
    const response = await this.merchantClientService.verifyRegistrationOtp({
      otp: otp,
      mobile_number: user.phoneNumber,
      sessionId: user.userSession || "YES"
    });
    if (response.statusCode == "S0200") {
      // update card data
      const card = await this.cardService.activateUserCard(user.id);
      return card;
    }
    throw new InternalServerErrorException('Failed to validate OTP');
  }

  async updateUserKycStatus(userId: string, updateKycStatus: keyof typeof KycVerificationStatus) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const isRequiredDocumentsUploaded = user.documents.length && user.documents
      .every((document) => ['AADHAR', 'AADHAR_BACK_SIDE', 'PAN'].includes(document.documentType));
    if (!isRequiredDocumentsUploaded) {
      throw new BadRequestException('AADHAR or PAN documents not uploaded');
    }
    const updatedStatus = KycVerificationStatus[updateKycStatus];
    user.kycVerificationStatus = updatedStatus;
    try {
      await this.userRepository.save(user);
      return 'User kyc status updated.';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async handleKycEvent(cardHolderId: string, kycStatus: string) {
    const user = await this.userRepository.findOne({ where: { cardHolderId: cardHolderId } });
    const kycColumnStatus = kycStatus === 'COMPLETED' ? KycVerificationStatus.COMPLETED : KycVerificationStatus.REJECTED;
    user.kycVerificationStatus = kycColumnStatus;
    await this.userRepository.save(user);
  }

  async getUsersByKycStatus(kycStatus: keyof typeof KycVerificationStatus) {
    const kycStatusValue = KycVerificationStatus[kycStatus];
    const users = await this.userRepository.find({
      where: {
        kycVerificationStatus: kycStatusValue
      }
    });
    return users.map((user) => new UserResponse(user));
  }

  async getUserStaticQR(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user || !user.staticQR) {
        return <StaticQRDTO>{
          url: null
        }
      }
      return <StaticQRDTO>{
        url: (await this.uploadFileService.getPresignedSignedUrl(user.staticQR)).url
      }
    } catch {
      return <StaticQRDTO>{
        url: null
      }
    }
  }

  async getKycStatusOfUser(userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId
    });
    if (user) {
      return KycVerificationStatus[user.kycVerificationStatus].toString();
    }
    throw new ForbiddenException('user does not have enough permission');
  }

  findUserById(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async sendVerificationCode(userId: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.otpFlowService.requestOtp(user.phoneNumber, user.email)
  }

  async verifyCodeAndUpdateUserPin(userId: string, otp: string, pin: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException('user not found');
    }
    try {
      await this.otpRepository.validateUserOtp(user.phoneNumber, otp);
      await this.setPin(userId, pin);
      return {
        message: "Pin Reset successfully!!!"
      }
    } catch {
      throw new BadRequestException('Failed to validate OTP');
    }

  }

  async updateUserKycDetails(userId: string, fileInfos: UpdateKycDetailUploadDto[]): Promise<boolean> {

    const userInfo = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userInfo) {
      throw new NotFoundException(`User not found`);
    }
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const fileInfo of fileInfos) {
        const documentInfo = await queryRunner.manager.findOne(UserDocument, {
          where: { user: { id: userId }, documentType: fileInfo.docType },
        });
        await this.saveDocumentInfo(fileInfo, userInfo, documentInfo, queryRunner.manager);
      }
      const userUploadedDocs = await queryRunner.manager.find(UserDocument, {
        where: {
          user: {
            id: userId
          }
        },
      });
      if (this.isKycVerificationDocumentsUploaded(fileInfos, userUploadedDocs)) {
        await queryRunner.manager.update(User, {}, {
          kycVerificationStatus: KycVerificationStatus.REQUESTED
        });
      }
      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof InternalServerErrorException) {
        throw new InternalServerErrorException(err.message);
      } else {
        throw err;
      }
    } finally {
      await queryRunner.release();
    }
  }

  private isKycVerificationDocumentsUploaded(docs: UpdateKycDetailUploadDto[], uploadedDocs: UserDocument[]) {
    const uploadedDocsTypes = docs.map(doc => doc.docType.toString());
    const alreadyUploadedDocs = uploadedDocs?.map(doc => doc.documentType);
    const mergedDocs = Array.from(new Set([...uploadedDocsTypes, ...alreadyUploadedDocs]))
    return mergedDocs.every(doc => KycRequiredDocTypes.includes(doc));
  }

  async getUserDocuments(userId: string) {
    const documents = await this.documentRepository.find({ where: { user: { id: userId } } }) ?? [];
    for (const document of documents) {
      document.documentUrl = (await this.uploadFileService.getPresignedSignedUrl(document.documentUrl)).url;
    }
    return documents.reduce((acc, item) => {
      acc[item.documentType] = new UserDocumentResponseDto(item);
      return acc;
    }, {});
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['merchant', 'card', 'address', 'loans', 'documents', 'beneficiaries']
    });
    if (!user) {
      throw new BadRequestException('user not found');
    }
    // @ToDo add DTO
    if (user.profileIcon) {
      const fileInfo = await this.uploadFileService.getPresignedSignedUrl(user.profileIcon);
      (user as any).profileUrl = fileInfo.url;
    }
    if (user.staticQR) {
      const fileInfo = await this.uploadFileService.getPresignedSignedUrl(user.staticQR);
      (user as any).staticQRUrl = fileInfo.url;
    }
    if (user.documents?.length) {
      for (const document of user.documents) {
        const fileInfo = await this.uploadFileService.getPresignedSignedUrl(document.documentUrl);
        document.documentUrl = fileInfo.url;
      }
    }
    (user as any).kycVerificationStatus = KycVerificationStatus[user.kycVerificationStatus].toString()
    return user;
  }

  async saveDocumentInfo(fileInfo: UpdateKycDetailUploadDto, userInfo: User, documentInfo?: UserDocument, entityManager?: EntityManager) {
    if (!entityManager) {
      entityManager = this.documentRepository.manager;
    }

    if (documentInfo) {
      documentInfo.description = fileInfo.description;
      documentInfo.documentUrl = fileInfo.fileKey;
      await entityManager.update(UserDocument, { user: userInfo, documentType: documentInfo.documentType },
        {
          description: fileInfo.description,
          documentUrl: fileInfo.fileKey
        }
      )
    } else {
      documentInfo = this.documentRepository.create({
        description: fileInfo.description,
        documentUrl: fileInfo.fileKey,
        documentType: fileInfo.docType,
        user: userInfo
      });
      await entityManager.save(documentInfo);
    }

    return true;
  }

  async updateProfileIcon(userId: string, file: Express.Multer.File) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const fileInfo = await this.uploadFileService.uploadSingleFile(file);
    user.profileIcon = fileInfo.key;
    await this.userRepository.save(user);
    return {
      message: 'Profile icon updated successfully!',
      fileUrl: fileInfo.url
    }
  }

  async updateStaticQR(userId: string, merchantId: string, file: Express.Multer.File) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const fileInfo = await this.uploadFileService.uploadSingleFile(file);
    user.staticQR = fileInfo.key;
    user.merchantPartnerId = merchantId;
    await this.userRepository.save(user);
    return {
      message: 'Static QR updated successfully!',
      fileUrl: fileInfo.url
    }
  }
}
