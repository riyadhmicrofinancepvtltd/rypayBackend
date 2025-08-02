import { SmsClientService } from '../sms-client.service';
import { OtpRepository } from '../repository/otp.repository';
import { sendOtpResponseDto } from '../dto/send-otp-response.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
export declare class OtpFlowService {
    private smsClientService;
    private otpRepository;
    private configService;
    private mailService;
    constructor(smsClientService: SmsClientService, otpRepository: OtpRepository, configService: ConfigService, mailService: MailService);
    sendOtp(phoneNumber: string, otp: string, emailId?: string | undefined): Promise<string>;
    requestOtp(phoneNumber: string, emailId?: string | undefined): Promise<sendOtpResponseDto>;
    requestOtpAppLockPin(phoneNumber: string, pin: string): Promise<sendOtpResponseDto>;
}
