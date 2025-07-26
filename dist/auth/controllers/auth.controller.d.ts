import { AuthService } from '../services/auth.service';
import { VerifyPhoneRequestDto } from '../dto/verify-phone-request.dto';
import { sendOtpResponseDto } from '../../notifications/dto/send-otp-response.dto';
import { UserApiResponseDto } from 'src/users/dto/user-response.dto';
import { sendOtpRequestDto } from '../../notifications/dto/send-otp-request.dto';
import { RefreshAccessTokenRequestDto } from '../dto/refresh-access-token-response.dto';
import { OtpFlowService } from 'src/notifications/services/otp-flow.service';
export declare class AuthController {
    private authService;
    private otpFlowService;
    constructor(authService: AuthService, otpFlowService: OtpFlowService);
    requestOtp(userPhone: sendOtpRequestDto): Promise<sendOtpResponseDto>;
    validateOtp(userPhone: VerifyPhoneRequestDto): Promise<UserApiResponseDto>;
    validateOtpNew(userPhone: VerifyPhoneRequestDto): Promise<UserApiResponseDto | {
        success: boolean;
        message: string;
        user: import("src/users/dto/user-response.dto").UserResponse;
        accessToken: string;
    }>;
    getUserResponse(req: any): Promise<UserApiResponseDto>;
    refreshAccessToken(refreshTokenDto: RefreshAccessTokenRequestDto): Promise<{
        accessToken: string;
        user: import("src/users/dto/user-response.dto").UserResponse;
    }>;
    logout(id: string, request: any): Promise<void>;
}
