import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/auth/services/token.service';
import { CardsService } from 'src/cards/services/cards.service';
import { PayoutService } from 'src/integration/busybox/external/services/payout.service';
import { UserDocument } from 'src/core/entities/document.entity';
import { User } from 'src/core/entities/user.entity';
import { VirtualAccount } from 'src/core/entities/virtual-account.entity';
import { Wallet } from 'src/core/entities/wallet.entity';
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';
import { MerchantClientService } from 'src/integration/busybox/external-system-client/merchant-client.service';
import { OtpRepository } from 'src/notifications/repository/otp.repository';
import { OtpFlowService } from 'src/notifications/services/otp-flow.service';
import { WalletBridge } from 'src/wallet/services/wallet.queue';
import { WalletService } from 'src/wallet/services/wallet.service';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { PhoneNumberExists } from '../dto/phone-number-exists.dto';
import { UpdateKycDetailUploadDto } from '../dto/user-kyc-upload.dto';
import { ChangeTransferPinDto } from "../dto/virtual-account-request.dto";
import { CreateOrderRequestDto } from '../dto/pin-request.dto';
import { UserAdminRequestDto, UserRequestDto, UserUpdateRequestDto } from '../dto/user-request.dto';
import { UserApiResponseDto, UserResponse } from '../dto/user-response.dto';
import { UploadFileService } from './updaload-file.service';
import { RechargeClientService } from 'src/integration/a1topup/external-system-client/recharge/recharge-client.service';
import { ValidateAadharDto } from '../dto/validate-aadhar.dto';
import { AadharResponse } from 'src/core/entities/aadhar-verification.entity';
import { NotificationBridge } from 'src/notifications/services/notification-bridge';
import { StaticQRDTO } from '../dto/static-qr.dto';
export declare class UsersService {
    private tokenService;
    private readonly httpService;
    private configService;
    private walletService;
    private merchantClientService;
    private cardService;
    private payoutService;
    private _connection;
    private uploadFileService;
    private otpFlowService;
    private otpRepository;
    private rechargeClient;
    private readonly walletBridge;
    private readonly notificationBridge;
    private userRepository;
    private walletRepository;
    private virtualAccountRepo;
    private aadharResponseRepo;
    private documentRepository;
    private readonly saltRounds;
    constructor(tokenService: TokenService, httpService: HttpService, configService: ConfigService, walletService: WalletService, merchantClientService: MerchantClientService, cardService: CardsService, payoutService: PayoutService, _connection: DataSource, uploadFileService: UploadFileService, otpFlowService: OtpFlowService, otpRepository: OtpRepository, rechargeClient: RechargeClientService, walletBridge: WalletBridge, notificationBridge: NotificationBridge, userRepository: Repository<User>, walletRepository: Repository<Wallet>, virtualAccountRepo: Repository<VirtualAccount>, aadharResponseRepo: Repository<AadharResponse>, documentRepository: Repository<UserDocument>);
    registerUser(userRequestDto: UserRequestDto): Promise<UserResponse>;
    registerUserNew(userRequestDto: UserRequestDto): Promise<UserResponse>;
    validateRefferelCode(referrelCode: string | null, queryRunner: QueryRunner): Promise<User>;
    deleteUser(userId: string): Promise<string>;
    deleteUserNew(userId: string, pin: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteProfileIcon(userId: string): Promise<string>;
    getUserDetail(userId: string): Promise<any>;
    registerUserAndGenerateToken(userRequestDto: UserRequestDto): Promise<UserApiResponseDto>;
    registerUserAndGenerateTokenNew(userRequestDto: UserRequestDto): Promise<UserApiResponseDto>;
    aadhaarVerifyOtp(userRequestDto: UserRequestDto): Promise<UserApiResponseDto>;
    requestAadharOtp(aadharNumber: string): Promise<{
        message: string;
        sessionId: any;
    }>;
    validateAadharOtp(requestBody: ValidateAadharDto): Promise<"Success" | "Failure">;
    registerAdminAndGenerateToken(userRequestDto: UserAdminRequestDto): Promise<UserApiResponseDto>;
    updateUserProfile(userId: string, userRequestDto: UserUpdateRequestDto): Promise<User>;
    editUserProfile(userId: string, userRequestDto: UserUpdateRequestDto): Promise<User>;
    checkPhoneNumberExists(phoneNumber: string): Promise<PhoneNumberExists>;
    getAllUsers(userId: string, searchQuery: string): Promise<UserResponse[]>;
    addProfileIconInUserResponse(userModel: User, userResponse: UserResponse): Promise<UserResponse>;
    setPin(userId: string, pin: string): Promise<void>;
    setAppLockPin(userId: string, pin: string): Promise<void>;
    verifyAppLockPin(userId: string, pin: string): Promise<boolean>;
    changeAppLockPin(userId: string, pin: string): Promise<void>;
    verifyAppLockPinOtp(userId: string, otp: string, pin: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createVirtualAccount(userId: string, customer_name: string, email: string, phoneNumber: string, transferPin: string): Promise<any>;
    getVirtualAccount(userId: string): Promise<any>;
    changeTransferPin(userId: string, changeTransferPinDto: ChangeTransferPinDto): Promise<any>;
    changeTransactionLockPin(userId: string, transferPin: string): Promise<void>;
    setTransactionLockPin(userId: string, newTransferPin: string): Promise<void>;
    verifyTransactionLockPinOtp(userId: string, otp: string, newTransferPin: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyPin(userId: string, pin: string): Promise<boolean>;
    verifyToContact(userId: string, phoneNumber: string): Promise<{
        success: boolean;
        message: string;
        user: {
            userId: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
        };
    }>;
    sendMoney(userId: string, paymentMode: string, amount: number, transactionPIN: string, number: string, upiId: string, upiUserName: string, message: string): Promise<{
        referenceId: string;
        amount: number;
        message: string;
    } | {
        success: boolean;
        message: string;
    }>;
    createOrder(userId: string, pinRequest: CreateOrderRequestDto): Promise<{
        success: boolean;
        message: string;
        orderId: any;
        payment_url: any;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: any;
        orderId?: undefined;
        payment_url?: undefined;
    }>;
    validateUserCardAssignment(userId: string, otp: string): Promise<import("src/core/entities/card.entity").Card>;
    updateUserKycStatus(userId: string, updateKycStatus: keyof typeof KycVerificationStatus): Promise<string>;
    handleKycEvent(cardHolderId: string, kycStatus: string): Promise<void>;
    getUsersByKycStatus(kycStatus: keyof typeof KycVerificationStatus): Promise<UserResponse[]>;
    getUserStaticQR(userId: string): Promise<StaticQRDTO>;
    getKycStatusOfUser(userId: string): Promise<string>;
    findUserById(userId: string): Promise<User>;
    sendVerificationCode(userId: string): Promise<void>;
    verifyCodeAndUpdateUserPin(userId: string, otp: string, pin: string): Promise<{
        message: string;
    }>;
    updateUserKycDetails(userId: string, fileInfos: UpdateKycDetailUploadDto[]): Promise<boolean>;
    private isKycVerificationDocumentsUploaded;
    getUserDocuments(userId: string): Promise<{}>;
    getUserProfile(userId: string): Promise<User>;
    saveDocumentInfo(fileInfo: UpdateKycDetailUploadDto, userInfo: User, documentInfo?: UserDocument, entityManager?: EntityManager): Promise<boolean>;
    updateProfileIcon(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        fileUrl: string;
    }>;
    updateStaticQR(userId: string, merchantId: string, file: Express.Multer.File): Promise<{
        message: string;
        fileUrl: string;
    }>;
}
