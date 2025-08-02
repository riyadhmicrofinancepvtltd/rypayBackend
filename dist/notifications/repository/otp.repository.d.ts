import { OtpInfo } from 'src/core/entities/otp-info.entity';
import { Repository } from 'typeorm';
import { OTPValidateStatus } from '../../auth/enum/otp-verification-status.enum';
export declare class OtpRepository {
    private otpRepo;
    constructor(otpRepo: Repository<OtpInfo>);
    upsertOtpInfo(phoneNumber: string, otp: string): Promise<OtpInfo>;
    validateUserOtp(phoneNumber: string, otp: string): Promise<{
        message: OTPValidateStatus;
    }>;
    validateUserOtpAppLockPin(phoneNumber: string, otp: string): Promise<{
        message: OTPValidateStatus;
    }>;
    validateUserOtpNew(phoneNumber: string, otp: string): Promise<{
        message: OTPValidateStatus;
    }>;
    updateOTPUsedRecord(record: OtpInfo): Promise<OtpInfo>;
    findByPhoneNumber(phoneNumber: string): Promise<OtpInfo>;
    isTimePassedOut(date: Date): boolean;
}
