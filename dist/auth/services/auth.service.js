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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../core/entities/user.entity");
const user_response_dto_1 = require("../../users/dto/user-response.dto");
const users_service_1 = require("../../users/services/users.service");
const typeorm_2 = require("typeorm");
const otp_repository_1 = require("../../notifications/repository/otp.repository");
const auth_util_1 = require("../utils/auth.util");
const token_service_1 = require("./token.service");
let AuthService = class AuthService {
    constructor(tokenService, otpRepository, userService, userRepo) {
        this.tokenService = tokenService;
        this.otpRepository = otpRepository;
        this.userService = userService;
        this.userRepo = userRepo;
    }
    async validateOTP(userPhoneInfo) {
        return await this.otpRepository
            .validateUserOtp(userPhoneInfo.phoneNumber, userPhoneInfo.otp)
            .then(async () => {
            return this.getUserData({ fcmToken: userPhoneInfo.fcmToken, phoneNumber: userPhoneInfo.phoneNumber });
        })
            .catch((err) => {
            if (err instanceof common_1.InternalServerErrorException) {
                throw new common_1.InternalServerErrorException(err.message);
            }
            throw err;
        });
    }
    async validateOTPNew(userPhoneInfo) {
        return await this.otpRepository
            .validateUserOtpNew(userPhoneInfo.phoneNumber, userPhoneInfo.otp)
            .then(async () => {
            return this.getUserDataNew({ fcmToken: userPhoneInfo.fcmToken, phoneNumber: userPhoneInfo.phoneNumber });
        })
            .catch((err) => {
            if (err instanceof common_1.InternalServerErrorException) {
                throw new common_1.InternalServerErrorException([err.message]);
            }
            throw err;
        });
    }
    async getUserDataNew(payload) {
        const where = payload.phoneNumber ? { phoneNumber: payload.phoneNumber } : { id: payload.userId };
        const userData = await this.userRepo.findOne({
            where: where,
            relations: { address: true, merchant: true, card: true },
        });
        const ALLOWED_PHONE = "8630221258";
        if (!userData && payload.phoneNumber !== ALLOWED_PHONE) {
            return {
                success: true,
                message: "Success",
                user: null,
                tokens: null,
            };
        }
        if (userData.isBlocked) {
            throw new common_1.BadRequestException(['user is blocked']);
        }
        if (payload.fcmToken) {
            const mobileDevices = userData.mobileDevices ?? [];
            const updatedTokens = Array.from(new Set([...mobileDevices, payload.fcmToken]));
            await this.userRepo.update({ id: userData.id }, { mobileDevices: updatedTokens });
        }
        const tokenPayload = auth_util_1.AuthUtil.getAccessTokenPayloadFromUserModel(userData);
        const tokens = await this.tokenService.generateTokens(tokenPayload);
        return {
            success: true,
            message: "Success",
            user: await this.userService.addProfileIconInUserResponse(userData, new user_response_dto_1.UserResponse(userData)),
            accessToken: tokens?.accessToken,
        };
    }
    async getUserData(payload) {
        const where = payload.phoneNumber ? { phoneNumber: payload.phoneNumber } : { id: payload.userId };
        const userData = await this.userRepo.findOne({
            where: where,
            relations: { address: true, merchant: true, card: true },
        });
        const ALLOWED_PHONE = "8630221258";
        if (!userData && payload.phoneNumber !== ALLOWED_PHONE) {
            return {
                success: true,
                message: "Success",
                user: null,
                tokens: null,
            };
        }
        if (userData.isBlocked) {
            throw new common_1.BadRequestException('user is blocked');
        }
        if (payload.fcmToken) {
            const mobileDevices = userData.mobileDevices ?? [];
            const updatedTokens = Array.from(new Set([...mobileDevices, payload.fcmToken]));
            await this.userRepo.update({ id: userData.id }, { mobileDevices: updatedTokens });
        }
        const tokenPayload = auth_util_1.AuthUtil.getAccessTokenPayloadFromUserModel(userData);
        const tokens = await this.tokenService.generateTokens(tokenPayload);
        return {
            success: true,
            message: "Success",
            user: await this.userService.addProfileIconInUserResponse(userData, new user_response_dto_1.UserResponse(userData)),
            tokens: tokens,
        };
    }
    async refreshToken(refreshToken) {
        return this.tokenService.createAccessTokenFromRefreshToken(refreshToken);
    }
    async revokeToken(userId) {
        try {
            return this.tokenService.revokeAccessToken(userId);
        }
        catch {
            throw new common_1.InternalServerErrorException('there is some error in revoking user access');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        otp_repository_1.OtpRepository,
        users_service_1.UsersService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map