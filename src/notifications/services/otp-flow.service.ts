import { Injectable } from '@nestjs/common';
import { SmsClientService } from '../sms-client.service';
import { OtpRepository } from '../repository/otp.repository';
import { sendOtpResponseDto } from '../dto/send-otp-response.dto';
import { ConfigService } from '@nestjs/config';
import * as otpGenerator from 'otp-generator';
import { MailService } from './mail.service';

@Injectable()
export class OtpFlowService {
  constructor(private smsClientService: SmsClientService, 
    private otpRepository: OtpRepository,
    private configService: ConfigService,
    private mailService: MailService
  ) {}

  async sendOtp(phoneNumber: string, otp: string, emailId: string | undefined = undefined) {
    try {
      const phoneApiCall = this.smsClientService.sendOtpToPhone(
        phoneNumber,
        otp,
      );
      const mailApiCall = emailId ? this.mailService.sendOtpMailToUser(emailId, 'RYPAY one time password', otp): Promise.resolve();
      await Promise.all([phoneApiCall, mailApiCall]);
      return "Success";
    } catch (err) {
      throw err;
    }
  }

  async requestOtp(phoneNumber: string, emailId: string | undefined = undefined) {
    const otpLength = this.configService.get('OTP_LENGTH');
    const generatedOtp = otpGenerator.generate(otpLength, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    /*
      send SMS message service code comes here
    */
    await this.sendOtp(phoneNumber, generatedOtp, emailId);
    let otpRecord = this.otpRepository.upsertOtpInfo(phoneNumber, generatedOtp);
    return otpRecord
      .then(() => {
        return {
          success: true,
          message: 'success',
        } as sendOtpResponseDto;
      })
      .catch((err) => {
        return {
          message: err.message,
        } as sendOtpResponseDto;
      });
  }
  async requestOtpAppLockPin(phoneNumber: string, pin: string ) {
   
    /*
      send SMS message service code comes here
    */
    await this.sendOtp(phoneNumber, pin);
    let otpRecord = this.otpRepository.upsertOtpInfo(phoneNumber, pin);
    return otpRecord
      .then(() => {
        return {
          success: true,
          message: 'success',
        } as sendOtpResponseDto;
      })
      .catch((err) => {
        return {
          message: err.message,
        } as sendOtpResponseDto;
      });
  }
}
