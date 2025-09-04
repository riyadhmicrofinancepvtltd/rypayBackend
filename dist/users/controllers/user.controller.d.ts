import { User } from 'src/core/entities/user.entity';
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';
import { KycVerificationStatusResponse } from '../dto/kyc-status.dto';
import { PhoneNumberExists } from '../dto/phone-number-exists.dto';
import { PinRequestDto, UpdateForgotPin, TransactionPinRequestDto, UpdateTransactionPinDto, deleteUserAccountDto, ToContactRequestDto, SendMoneyRequestDto } from '../dto/pin-request.dto';
import { VirtualAccountRequestDto } from "../dto/virtual-account-request.dto";
import { ChangeTransferPinDto } from "../dto/virtual-account-request.dto";
import { UpdateKycDetailUploadDto } from '../dto/user-kyc-upload.dto';
import { UserAdminRequestDto, UserRequestDto, UserUpdateRequestDto, ValidateOTPAfterCardCreationDTO } from '../dto/user-request.dto';
import { UserApiResponseDto, UserResponse } from '../dto/user-response.dto';
import { ValidateAadharDto } from '../dto/validate-aadhar.dto';
import { UploadFileService } from '../services/updaload-file.service';
import { UsersService } from '../services/users.service';
import { StaticQRDTO } from '../dto/static-qr.dto';
export declare class UsersController {
    private userService;
    private uploadFileService;
    constructor(userService: UsersService, uploadFileService: UploadFileService);
    register(signUpDto: UserRequestDto): Promise<UserApiResponseDto>;
    registerNew(signUpDto: UserRequestDto): Promise<UserApiResponseDto>;
    aadharVerifyOtp(signUpDto: UserRequestDto): Promise<UserApiResponseDto>;
    requestAadharOtp(aadharNumber: string): Promise<any>;
    validateAadharOtp(body: ValidateAadharDto): Promise<string>;
    deleteUser(req: any): Promise<string>;
    deleteUserNew(req: any, pinRequest: deleteUserAccountDto): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteProfileIcon(req: any): Promise<string>;
    getUserDetail(req: any): Promise<any>;
    registerAdmin(signUpDto: UserAdminRequestDto): Promise<UserApiResponseDto>;
    updateUser(userId: string, updateDto: UserUpdateRequestDto): Promise<User>;
    EditUser(userId: string, updateDto: UserUpdateRequestDto): Promise<User>;
    getAllUser(req: any, search: any): Promise<UserResponse[]>;
    checkUserExist(phoneNumber: string): Promise<PhoneNumberExists>;
    updateProfileIcon(file: Express.Multer.File, req: any): Promise<{
        message: string;
        fileUrl: string;
    }>;
    updateStaticQR(userId: string, file: Express.Multer.File, merchantId: string): Promise<{
        message: string;
        fileUrl: string;
    }>;
    changeTransactionLockPin(req: any, pinRequest: TransactionPinRequestDto): Promise<{
        valid: boolean;
    }>;
    verifyTransactionLockPinOtp(req: any, body: UpdateTransactionPinDto): Promise<{
        success: boolean;
        message: string;
    }>;
    setPin(req: any, pinRequest: PinRequestDto): Promise<{
        message: string;
    }>;
    setAppLockPin(req: any, pinRequest: PinRequestDto): Promise<{
        message: string;
    }>;
    verifyAppLockPin(req: any, pinRequest: PinRequestDto): Promise<{
        valid: boolean;
    }>;
    changeAppLockPin(req: any, pinRequest: PinRequestDto): Promise<{
        valid: boolean;
    }>;
    verifyAppLockPinOtp(req: any, body: UpdateForgotPin): Promise<{
        success: boolean;
        message: string;
    }>;
    createVirtualAccount(req: any, virtualRequest: VirtualAccountRequestDto): Promise<{
        message: string;
    }>;
    getVirtualAccount(req: any): Promise<{
        message: string;
    }>;
    changeTransferPin(req: any, changeTransferPinDto: ChangeTransferPinDto): Promise<{
        message: string;
    }>;
    verifyPin(req: any, pinRequest: PinRequestDto): Promise<{
        valid: boolean;
    }>;
    requestResetPin(req: any): Promise<{
        message: string;
    }>;
    verifyToContact(req: any, pinRequest: ToContactRequestDto): Promise<{
        success: boolean;
        message: string;
        user: {
            userId: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
        };
    }>;
    sendMoney(req: any, pinRequest: SendMoneyRequestDto): Promise<{
        referenceId: string;
        amount: number;
        message: string;
    } | {
        success: boolean;
        message: string;
    }>;
    updateForgotPin(req: any, body: UpdateForgotPin): Promise<{
        message: string;
    }>;
    updateKYC(req: any, kycStatus: keyof typeof KycVerificationStatus): Promise<string>;
    getKYCInitiatedUsers(kycStatus: keyof typeof KycVerificationStatus): Promise<UserResponse[]>;
    getUserStaticQR(req: any): Promise<StaticQRDTO>;
    getKycStatusOfUser(req: any): Promise<KycVerificationStatusResponse>;
    validateCard(req: any, otpRequest: ValidateOTPAfterCardCreationDTO): Promise<{
        isVerified: boolean;
        cardDetails: import("../../core/entities/card.entity").Card;
    }>;
    getMyDocuments(req: any): Promise<{
        data: {};
    }>;
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
    getUserProfile(userId: string): Promise<User>;
    updateKYCDocument(req: any, userDocsInfo: UpdateKycDetailUploadDto[]): Promise<{
        success: boolean;
    }>;
}
