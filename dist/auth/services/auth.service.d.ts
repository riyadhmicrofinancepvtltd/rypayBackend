import { User } from 'src/core/entities/user.entity';
import { UserApiResponseDto, UserResponse } from 'src/users/dto/user-response.dto';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';
import { OtpRepository } from '../../notifications/repository/otp.repository';
import { VerifyPhoneRequestDto } from '../dto/verify-phone-request.dto';
import { TokenService } from './token.service';
export declare class AuthService {
    private tokenService;
    private otpRepository;
    private userService;
    private userRepo;
    constructor(tokenService: TokenService, otpRepository: OtpRepository, userService: UsersService, userRepo: Repository<User>);
    validateOTP(userPhoneInfo: VerifyPhoneRequestDto): Promise<UserApiResponseDto>;
    validateOTPNew(userPhoneInfo: VerifyPhoneRequestDto): Promise<UserApiResponseDto | {
        success: boolean;
        message: string;
        user: UserResponse;
        accessToken: string;
    }>;
    getUserDataNew(payload: {
        fcmToken?: string;
        phoneNumber?: string;
        userId?: string;
    }): Promise<UserApiResponseDto | {
        success: boolean;
        message: string;
        user: UserResponse;
        accessToken: string;
    }>;
    getUserData(payload: {
        fcmToken?: string;
        phoneNumber?: string;
        userId?: string;
    }): Promise<UserApiResponseDto>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        user: UserResponse;
    }>;
    revokeToken(userId: string): Promise<void>;
}
