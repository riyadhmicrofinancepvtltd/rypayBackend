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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargeClientService = void 0;
const axios_1 = require("@nestjs/axios");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const rxjs_1 = require("rxjs");
const integration_constant_1 = require("../../external/constants/integration.constant");
let RechargeClientService = class RechargeClientService {
    constructor(httpService, logger, configService, cacheManager) {
        this.httpService = httpService;
        this.logger = logger;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.apiBaseUrl = this.configService.get('RECHARGE_API_BASE_URL');
        this.apiToken = this.configService.get('RECHARGE_API_SECRET_KEY');
    }
    async initRecharge(rechargePayload) {
        const body = {
            token: this.apiToken,
            ...rechargePayload,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Recharge API error:', error);
            throw error;
        }
    }
    async registerOutlet(requestData) {
        const body = {
            token: this.apiToken,
            ...requestData,
            transType: 'outletRegister',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Outlet registration request error:', error);
            throw error;
        }
    }
    async verifyOtpForOutletRegistration(requestData) {
        const body = {
            token: this.apiToken,
            ...requestData,
            transType: 'outletRegisterVerify',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('OTP verification request error:', error);
            throw error;
        }
    }
    async checkOutletStatus(requestData) {
        const body = {
            token: this.apiToken,
            ...requestData,
            transType: 'outletStatus',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Outlet status check request error:', error);
            throw error;
        }
    }
    async getAEPSSupportedBankList() {
        const body = {
            token: this.apiToken,
            transType: 'aepsBankList',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('AEPS supported bank list request error:', error);
            throw error;
        }
    }
    async outletLogin(loginData) {
        const body = {
            token: this.apiToken,
            ...loginData,
            transType: 'outletAepsLogin',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Outlet login request error:', error);
            throw error;
        }
    }
    async getAepsMiniStatement(miniStatementData) {
        const body = {
            token: this.apiToken,
            ...miniStatementData,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('AEPS MiniStatement request error:', error);
            throw error;
        }
    }
    async getAepsWithdrawal(withdrawalData) {
        const body = {
            token: this.apiToken,
            ...withdrawalData,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('AEPS Withdrawal request error:', error);
            throw error;
        }
    }
    async requestAadharOtp(aadharNumber) {
        const urid = Math.floor(100000000 + Math.random() * 900000000);
        const body = {
            token: this.apiToken,
            aadhaarNumber: aadharNumber,
            transType: 'aadhaarSendOtp',
            urid: urid.toString(),
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Aadhar eKYC request error :', error);
            throw error;
        }
    }
    async validateUPI(upiId) {
        const urid = Math.floor(100000000 + Math.random() * 900000000);
        const body = {
            token: this.apiToken,
            upiId: upiId,
            urid: urid.toString(),
            transType: 'upiName',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Aadhar eKYC request error :', error);
            throw error;
        }
    }
    async validateBank(accountNumber, ifscCode) {
        const urid = Math.floor(100000000 + Math.random() * 900000000);
        const body = {
            token: this.apiToken,
            urid: urid.toString(),
            transType: 'bankAccountValidate',
            ifscCode: ifscCode,
            accountNumber: accountNumber,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Aadhar eKYC request error :', error);
            throw error;
        }
    }
    async validateAadharOtp(aadharNumber, otp, sessionId) {
        const urid = Math.floor(100000000 + Math.random() * 900000000);
        const body = {
            token: this.apiToken,
            aadhaarNumber: aadharNumber,
            otp: otp,
            otpSessionId: sessionId,
            transType: "aadhaarVerifyOtp",
            urid: urid.toString(),
        };
        console.log("verify payload==>", body);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Aadhar eKYC validation error :', error);
            throw error;
        }
    }
    async initUtilityPayment(utilityPayload) {
        const params = {
            token: this.apiToken,
            ...utilityPayload,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/transaction.php`, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Bill payment API error:', error);
            throw error;
        }
    }
    async getServiceProvidersList() {
        const body = {
            token: this.apiToken
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/operatorList.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('Service provider list error:', error);
            throw error;
        }
    }
    async getMobileProviderInfo(mobile) {
        const params = {
            token: this.apiToken,
            number: mobile
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/operator_fetch.php`, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error('get mobile provider info error:', error);
            throw error;
        }
    }
    async fetchBill(billPayload) {
        const body = {
            token: this.apiToken,
            ...billPayload
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('get bill details error:', error);
            throw error;
        }
    }
    async getCircleCodeList() {
        const body = {
            token: this.apiToken
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/utility/stateList.php`, body));
            return response.data;
        }
        catch (error) {
            this.logger.error('state list API error:', error);
            throw error;
        }
    }
    async getRechargePlansList(operatorId) {
        const params = {
            token: this.apiToken,
            operatorId: operatorId,
            transType: 'mobilePlan'
        };
        const rechargePlanKey = `recharge_${operatorId}`;
        try {
            const cachedData = await this.cacheManager.get(rechargePlanKey);
            if (cachedData) {
                return cachedData;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/utility/transaction.php`, { params }));
            await this.cacheManager.set(rechargePlanKey, response.data, integration_constant_1.RedisKeyConstant.PlanApiTTL);
            return response.data;
        }
        catch (error) {
            this.logger.error('Recharge plans API error:', error);
            throw error;
        }
    }
    async getCurrentBalance() {
        const username = this.configService.get('RECHARGE_API_USERNAME');
        const password = this.configService.get('RECHARGE_API_PASSWORD');
        const params = {
            username,
            pwd: password,
            format: 'json',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/balance`, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Recharge Status API error:', error);
            throw error;
        }
    }
};
exports.RechargeClientService = RechargeClientService;
exports.RechargeClientService = RechargeClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_pino_1.InjectPinoLogger)(RechargeClientService.name)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        nestjs_pino_1.Logger,
        config_1.ConfigService, Object])
], RechargeClientService);
//# sourceMappingURL=recharge-client.service.js.map