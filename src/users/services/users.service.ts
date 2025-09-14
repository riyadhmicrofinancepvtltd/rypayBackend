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
import { PayoutService } from 'src/integration/busybox/external/services/payout.service';
import { CardStatus } from 'src/core/entities/card.entity';
import { UserDocument } from 'src/core/entities/document.entity';
import { User } from 'src/core/entities/user.entity';
import { VirtualAccount } from 'src/core/entities/virtual-account.entity'
import { Transaction } from 'src/core/entities/transactions.entity';
import { TransactionMoney } from 'src/core/entities/transaction-money.entity';
import { Wallet } from 'src/core/entities/wallet.entity';
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';
import { TransactionStatus } from 'src/core/entities/transactions.entity';

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
import { ChangeTransferPinDto } from "../dto/virtual-account-request.dto"
import { CreateOrderRequestDto, PaymentStatusRequestDto } from '../dto/pin-request.dto';
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
    private payoutService: PayoutService,
    private _connection: DataSource,
    private uploadFileService: UploadFileService,
    private otpFlowService: OtpFlowService,
    private otpRepository: OtpRepository,
    private rechargeClient: RechargeClientService,
    private readonly walletBridge: WalletBridge,
    private readonly notificationBridge: NotificationBridge,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    @InjectRepository(VirtualAccount) private virtualAccountRepo: Repository<VirtualAccount>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(TransactionMoney) private transactionMoneyRepo: Repository<TransactionMoney>,
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
  async registerUserNew(userRequestDto: UserRequestDto) {
    console.log(userRequestDto);
    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = UserMapper.mapUserRequestDtoToEntity(userRequestDto);
      const referrer = await this.validateRefferelCode(userRequestDto.referrelCode, queryRunner);
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
        throw new InternalServerErrorException([err.message]);
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

  async deleteUserNew(
    userId: string,
    pin: string,
    reason: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(['User not found']);
    }

    // 🔧 Must use await here
    const valid = await bcrypt.compare(pin, user.pin);
    if (!valid) {
      throw new BadRequestException(['Invalid lock pin']);
    }

    user.reason = reason;
    user.isBlocked = true;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User account deleted successfully',
    };
  }

  async deleteProfileIcon(userId: string): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new ForbiddenException('User does not exist or lacks permissions');
    }
    user.profileIcon = null;
    await this.userRepository.save(user);
    return {
      success: true,
      message: 'User profile icon removed successfully',
    } as any
  }


  async getUserDetail(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['beneficiaries', 'card', 'address', 'merchant'],
    });
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    const account = user.beneficiaries?.[0]; // or filter for a "primary" one

    const accountDetails = account ? {
      accountNumber: account.bankAccountNumber,
      ifscCode: account.ifscCode,
      nameInBank: account.nameInBank,
      //upi: account.upi
    } : null;
    let fileInfo = null;
    if (user.profileIcon) {
      fileInfo = await this.uploadFileService.getPresignedSignedUrl(user.profileIcon);
    }
    return {
      success: true,
      message: 'Fetched User Data',
      user: {
        userid: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        userRole: user.role,
        profileUrl: fileInfo ? fileInfo?.url : null,
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
        merchantInfo: user.merchant ? {
          shopName: user.merchant.shopName,
          gstNumber: user.merchant.gstNumber,
          msmeNumber: user.merchant.msmeNumber,
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
  //
  async registerUserAndGenerateTokenNew(
    userRequestDto: UserRequestDto,
  ): Promise<UserApiResponseDto> {
    if (userRequestDto.userType === UserRole.MERCHANT) {
      if (!userRequestDto.merchantInfo.shopName) {
        throw new BadRequestException(["Shop name is required"]);
      }
    }
    const userExists = await this.userRepository.findOne({
      where: {
        phoneNumber: userRequestDto.phoneNumber,
      }
    });
    if (userExists) {
      throw new BadRequestException(['User already exists']);
    }

    const data = await this.rechargeClient.requestAadharOtp(userRequestDto.aadharNumber);
    if (data.status === "SUCCESS") {
      return {
        success: true,
        message: "OTP has been sent successfully to your registered mobile number.",
        sessionId: data.aadhaarData?.otpSessionId
      } as any;
    }
    throw new BadRequestException(['Failed to send OTP. Please ensure your Aadhar number is valid and try again.']);
  }


  async aadhaarVerifyOtp(
    userRequestDto: UserRequestDto,
  ): Promise<UserApiResponseDto> {
    if (!userRequestDto.otp) {
      throw new BadRequestException(["OTP is required"]);
    }
    const response = await this.rechargeClient.validateAadharOtp(userRequestDto.aadharNumber, userRequestDto.otp, userRequestDto.otpSessionId);
    if (response.status === "SUCCESS" && response.transId === "OTP_VERIFIED") {
      await this.aadharResponseRepo.save(this.aadharResponseRepo.create({
        aadharNumber: userRequestDto.aadharNumber,
        aadharResponse: response
      }));
      const orgId = this.configService.get('BUSY_BOX_ORG_ID');
      const issueCardDto = UserMapper.mapUserRequestDtoToMerchantRegistrationDto(userRequestDto, orgId);
      const userResponse = await this.merchantClientService.issueCard(issueCardDto);
      if (userResponse.status === "SUCCESS") {
        userRequestDto.cardHolderId = userResponse.data.cardHolderId;
        userRequestDto.userSession = userResponse.sessionId;
        const user = await this.registerUserNew(userRequestDto);
        const tokenPayload = <IAccessTokenUserPayload>{
          userId: user.userid,
          phoneNumber: user.phoneNumber,
          role: user.userRole,
        };
        const tokens = await this.tokenService.generateTokens(tokenPayload);
        return {
          success: true,
          message: "OTP verified successfully and user registered.",
          user,
          accessToken: tokens?.accessToken,
        } as any;
      }
      throw new InternalServerErrorException(["Failed to issue card for the user"]);
    }

    throw new BadRequestException(["Try Again after sometime."]);

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
  async editUserProfile(userId: string,
    userRequestDto: UserUpdateRequestDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['beneficiaries', 'card', 'address', 'merchant'], });
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const updatedUserEntity = UserMapper.mapUserUpdateRequestDtoToUserEntityNew(user, userRequestDto);
    await this.userRepository.save(updatedUserEntity);
    //user.kycVerificationStatus =  KycVerificationStatus[user.kycVerificationStatus];
    const kycStatusString = KycVerificationStatus[user.kycVerificationStatus];
    let fileInfo = null;
    if (user.profileIcon) {
      fileInfo = await this.uploadFileService.getPresignedSignedUrl(user.profileIcon);
    }


    const { merchant, ...rest } = user;

    return {
      success: true,
      message: 'User profile updated successfully',
      user: {
        ...rest,
        profileUrl: fileInfo ? fileInfo.url : null,
        merchantInfo: merchant,
        kycVerificationStatus: kycStatusString,
      }
    } as any;
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

  async setAppLockPin(userId: string, pin: string): Promise<void> {
    const hashedPin = await bcrypt.hash(pin, this.saltRounds);
    await this.userRepository.update(userId, { pin: hashedPin });
  }
  //verifyAppLockPin
  async verifyAppLockPin(userId: string, pin: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException(['User not found']);
    }
    return bcrypt.compare(pin, user.pin);
  }

  async changeAppLockPin(userId: string, pin: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    await this.otpFlowService.requestOtpAppLockPin(user.phoneNumber)
  }

  async verifyAppLockPinOtp(userId: string, otp: string, pin: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException(['user not found']);
    }
    return await this.otpRepository
      .validateUserOtpAppLockPin(user.phoneNumber, otp)
      .then(async () => {
        await this.setAppLockPin(userId, pin);
        return { success: true, message: "Otp verified successfully and pin changed successfully" };
      })
      .catch((err) => {
        if (err instanceof InternalServerErrorException) {
          throw new InternalServerErrorException([err.message]);
        }
        throw err;
      });
  }

  async createVirtualAccount(
    userId: string,
    customer_name: string,
    email: string,
    phoneNumber: string,
    transferPin: string
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
      if (!/^\d{6}$/.test(transferPin)) {
        throw new BadRequestException({
          statusCode: 400,
          success: false,
          message: 'transferPin must be exactly 6 digits',
        });
      }

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
      const hashedPin = await bcrypt.hash(transferPin, this.saltRounds);
      let data = response.data;
      const newAccount = this.virtualAccountRepo.create({
        accountid: data.data.accountId,
        accountnumber: data.data.accountNumber,
        ifsccode: data.data.ifscCode,
        status: data.data.status || 'ACTIVE',
        userid: userId,
        number: phoneNumber,
        transfer_pin: hashedPin
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
    if (!user) {
      return {
        success: false,
        message: "Virtual account not found",
        data: null,
      };
    }
    return {
      success: true,
      message: "Virtual account fetched successfully",
      data: {
        accountId: user.accountid,
        accountNumber: user.accountnumber,
        ifscCode: user.ifsccode,
        status: user.status,
        createOn: user.createon,
      }
    }
  }
  async changeTransferPin(
    userId: string,
    changeTransferPinDto: ChangeTransferPinDto
  ): Promise<any> {
    try {
      const user = await this.virtualAccountRepo.findOne({ where: { userid: userId } });
      if (!user) {
        throw new BadRequestException({
          statusCode: 400,
          success: false,
          message: "Virtual account not found",
        });
      }
      if (!/^\d{6}$/.test(changeTransferPinDto.newTransferPin)) {
        throw new BadRequestException({
          statusCode: 400,
          success: false,
          message: 'transferPin must be exactly 6 digits',
        });
      }
      const isOldPinCorrect = await bcrypt.compare(
        changeTransferPinDto.oldTransferPin,
        user.transfer_pin,
      );
      if (!isOldPinCorrect) {
        throw new BadRequestException({
          statusCode: 400,
          success: false,
          message: 'Old transferPin is not correct',
        });
      }
      const newHashedPin = await bcrypt.hash(changeTransferPinDto.newTransferPin, 10);
      user.transfer_pin = newHashedPin;
      await this.virtualAccountRepo.save(user);
      return {
        statusCode: 200,
        success: true,
        message: "TransferPin changed successfully",
        data: null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          statusCode: 400,
          success: false,
          message: error.message,
        };
      }
      throw new InternalServerErrorException({
        statusCode: 500,
        success: false,
        message: 'Failed to change transfer pin',
      });
    }
  }

  //changeTransactionLockPin
  async changeTransactionLockPin(userId: string, transferPin: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    await this.otpFlowService.requestOtpAppLockPin(user.phoneNumber)
  }

  async setTransactionLockPin(userId: string, newTransferPin: string): Promise<void> {
    const user = await this.virtualAccountRepo.findOne({ where: { userid: userId } });
    const newHashedPin = await bcrypt.hash(newTransferPin, 10);
    user.transfer_pin = newHashedPin;
    await this.virtualAccountRepo.save(user);

  }

  //verifyTransactionLockPinOtp
  async verifyTransactionLockPinOtp(userId: string, otp: string, newTransferPin: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException(['user not found']);
    }
    return await this.otpRepository
      .validateUserOtpAppLockPin(user.phoneNumber, otp)
      .then(async () => {
        await this.setTransactionLockPin(userId, newTransferPin);
        return { success: true, message: "Otp verified successfully and  transaction pin changed successfully" };
      })
      .catch((err) => {
        if (err instanceof InternalServerErrorException) {
          throw new InternalServerErrorException([err.message]);
        }
        throw err;
      });
  }


  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return bcrypt.compare(pin, user.pin);
  }

  async verifyToContact(userId: string, phoneNumber: string) {
    const user = await this.userRepository.findOneBy({ phoneNumber: phoneNumber });
    if (!user) {
      throw new BadRequestException(['Rypay account not found ']);
    }
    return {
      success: true,
      message: 'User found',
      user: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      }
    }

  }


  async getTransactionHistory(userId: string, page = 1, limit = 10) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException(['user not found']);
    }
  
    const [transactionMoney, totalItems] = await this.transactionMoneyRepo.findAndCount({
      where: { user_id: userId },
      order: { transaction_date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  
    const totalPages = Math.ceil(totalItems / limit);
  
    return {
      success: true,
      message: "Fetched Transaction History",
      transactionMoney,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
  
  async sendMoney(
    userId: string,
    paymentMode: string,
    amount: number,
    transactionPIN: string,
    number: string,
    upiId: string,
    upiUserName: string,
    message: string,
    accountNumber: string,
    ifsc: string,
    mode: string,
    userName: string,
  ) {
    let enumKey = ["upi", "number", "bank"].find(key => key === paymentMode);
    if (!enumKey) {
      throw new BadRequestException(['Invalid payment mode']);
    }
    if (paymentMode === "number") {
      const userTo = await this.userRepository.findOneBy({ phoneNumber: number });
      if (!userTo) {
        throw new BadRequestException(['Rypay account not found']);
      }
      const userFrom = await this.userRepository.findOne({ where: { id: userId } });
      const virtualAccount = await this.virtualAccountRepo.findOne({ where: { userid: userId } });
      const isOldPinCorrect = await bcrypt.compare(
        transactionPIN,
        virtualAccount.transfer_pin,
      );
      if (!isOldPinCorrect) {
        throw new BadRequestException(['Incorrect PIN. Please try again.']);
      }
      if (userFrom) {
        let wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
        if (wallet.balance >= amount) {
          wallet.balance = wallet.balance - amount
          await this.walletRepository.save(wallet);
        } else {
          return {
            success: false,
            message: 'Insufficient balance',
          }
        }
      }
      if (userTo) {
        let walletTo = await this.walletRepository.findOneBy({ user: { id: userTo.id } });
        walletTo.balance = walletTo.balance + amount
        await this.walletRepository.save(walletTo);
      }
      return { success: true, message: "Money sent successfully." };
    }
    if (paymentMode === "upi") {
      const virtualAccount = await this.virtualAccountRepo.findOne({ where: { userid: userId } });
      const isOldPinCorrect = await bcrypt.compare(
        transactionPIN,
        virtualAccount.transfer_pin,
      );
      if (!isOldPinCorrect) {
        return {
          success: false,
          message: 'Incorrect PIN. Please try again.',
        }
      }
      let payload = {
        upiId: upiId,
        amount: amount,
        mobile: number,
        upiUserName: upiUserName,
        message: message
      } as any
      const data = await this.payoutService.payoutUPINew(userId, payload);
      if (data?.referenceId) {
        return { success: true, message: "Money sent successfully." };
      }
      return data;
    }
    if (paymentMode === "bank") {
      const virtualAccount = await this.virtualAccountRepo.findOne({ where: { userid: userId } });
      const isOldPinCorrect = await bcrypt.compare(
        transactionPIN,
        virtualAccount.transfer_pin,
      );
      if (!isOldPinCorrect) {
        return {
          success: false,
          message: 'Incorrect PIN. Please try again.',
        }
      }
      let payload = {
        accountNumber: accountNumber,
        amount: amount,
        ifsc: ifsc,
        mobile: number,
        mode: mode,
        message: message,
        userName: userName
      } as any

      const data = await this.payoutService.payoutAccountNew(userId, payload);
      if (data?.referenceId) {
        const newAccount = this.transactionMoneyRepo.create({
          name: userName,
          type: 'CREDIT',
          amount: Number(amount),   // ✅ convert string → number
          message: message,
          reference: data.referenceId,
          transaction_date: new Date(),
          status: "SUCCESS",  
          ifsc: ifsc, 
          user_id: userId,
          transaction_id: data.referenceId,
          bank: accountNumber.toString(),    
        });
        const saved = await this.transactionMoneyRepo.save(newAccount);
        return { success: true, message: "Money sent successfully." };
      }
      return data;
    }

  }

  async createOrder(userId: string, pinRequest: CreateOrderRequestDto) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException(['user not found']);
    }
    const upiBaseUrl = this.configService.get('UPI_BASE_URL') || "https://api.upitranzact.com/v1";
    const authKey = this.configService.get('UPI_AUTH_KEY') || 'dXR6X2xpdmVfMTE2N2I4MmU1NjBlMjY1MTo0NjY2ZTY2ZmQ1OWEzOWQ1OWQ3MWJrag==';
    const mid = this.configService.get('UPI_MID') || 'SSRSOLUTIO';
    const url = `${upiBaseUrl}/payments/createOrderRequest`;

    const payload = {
      mid: mid,
      amount: pinRequest.amount,
      redirect_url: "https://api.riyadhmicrofinance.com?status=paymentSuccess",
      note: pinRequest.note,
      customer_name: pinRequest.customer_name,
      customer_email: pinRequest.customer_email,
      customer_mobile: pinRequest.customer_mobile,
    };
    const response = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authKey}`,
        },
      },

      )
    );

    if (response.data.statusCode == "200") {
      return {
        success: true,
        message: "Order created successfully",
        orderId: response.data.data.orderId,
        payment_url: response.data.data.payment_url,
      };
    }
    return {
      success: false,
      message: "Failed to create order",
      data: response.data
    };


  }

  async checkPaymentStatus(userId: string, statusRequest: PaymentStatusRequestDto) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException(['user not found']);
    }
    const upiBaseUrl = this.configService.get('UPI_BASE_URL') || "https://api.upitranzact.com/v1";
    const authKey = this.configService.get('UPI_AUTH_KEY') || 'dXR6X2xpdmVfMTE2N2I4MmU1NjBlMjY1MTo0NjY2ZTY2ZmQ1OWEzOWQ1OWQ3MWJrag==';
    const mid = this.configService.get('UPI_MID') || 'SSRSOLUTIO';
    const url = `${upiBaseUrl}/payments/checkPaymentStatus`;

    const payload = {
      mid: mid,
      order_id: statusRequest.order_id,
    };
    const response = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authKey}`,
        },
      },

      )
    );

    if (response.data.txnStatus == "SUCCESS") {
      let wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
      wallet.balance = wallet.balance + response.data.data.amount
      await this.walletRepository.save(wallet);
      return {
        success: true,
        message: "Payment status checked successfully",
        data: response.data
      };
    }
    return {
      success: false,
      message: response.data.msg,
    };


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
