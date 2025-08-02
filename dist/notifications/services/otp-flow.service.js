"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpFlowService = void 0;
const common_1 = require("@nestjs/common");
const sms_client_service_1 = require("../sms-client.service");
const otp_repository_1 = require("../repository/otp.repository");
const config_1 = require("@nestjs/config");
const otpGenerator = require("otp-generator");
const mail_service_1 = require("./mail.service");
let OtpFlowService = class OtpFlowService {
    constructor(smsClientService, otpRepository, configService, mailService) {
        this.smsClientService = smsClientService;
        this.otpRepository = otpRepository;
        this.configService = configService;
        this.mailService = mailService;
    }
    async sendOtp(phoneNumber, otp, emailId = undefined) {
        try {
            const phoneApiCall = this.smsClientService.sendOtpToPhone(phoneNumber, otp);
            const mailApiCall = emailId ? this.mailService.sendOtpMailToUser(emailId, 'RYPAY one time password', otp) : Promise.resolve();
            await Promise.all([phoneApiCall, mailApiCall]);
            return "Success";
        }
        catch (err) {
            throw err;
        }
    }
    async requestOtp(phoneNumber, emailId = undefined) {
        const otpLength = this.configService.get('OTP_LENGTH');
        const generatedOtp = otpGenerator.generate(otpLength, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        await this.sendOtp(phoneNumber, generatedOtp, emailId);
        let otpRecord = this.otpRepository.upsertOtpInfo(phoneNumber, generatedOtp);
        return otpRecord
            .then(() => {
            return {
                success: true,
                message: 'success',
            };
        })
            .catch((err) => {
            return {
                message: err.message,
            };
        });
    }
    async requestOtpAppLockPin(phoneNumber, pin) {
        await this.sendOtp(phoneNumber, pin);
        let otpRecord = this.otpRepository.upsertOtpInfo(phoneNumber, pin);
        return otpRecord
            .then(() => {
            return {
                success: true,
                message: 'success',
            };
        })
            .catch((err) => {
            return {
                message: err.message,
            };
        });
    }
};
exports.OtpFlowService = OtpFlowService;
exports.OtpFlowService = OtpFlowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sms_client_service_1.SmsClientService,
        otp_repository_1.OtpRepository,
        config_1.ConfigService,
        mail_service_1.MailService])
], OtpFlowService);
//# sourceMappingURL=otp-flow.service.js.map