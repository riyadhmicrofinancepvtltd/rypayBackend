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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const swagger_1 = require("@nestjs/swagger");
const verify_phone_request_dto_1 = require("../dto/verify-phone-request.dto");
const send_otp_response_dto_1 = require("../../notifications/dto/send-otp-response.dto");
const user_response_dto_1 = require("../../users/dto/user-response.dto");
const send_otp_request_dto_1 = require("../../notifications/dto/send-otp-request.dto");
const refresh_access_token_request_dto_1 = require("../dto/refresh-access-token-request.dto");
const refresh_access_token_response_dto_1 = require("../dto/refresh-access-token-response.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const user_role_enum_1 = require("../../core/enum/user-role.enum");
const otp_flow_service_1 = require("../../notifications/services/otp-flow.service");
let AuthController = class AuthController {
    constructor(authService, otpFlowService) {
        this.authService = authService;
        this.otpFlowService = otpFlowService;
    }
    async requestOtp(userPhone) {
        return this.otpFlowService.requestOtp(userPhone.phone);
    }
    async validateOtp(userPhone) {
        return this.authService.validateOTP(userPhone);
    }
    async validateOtpNew(userPhone) {
        return this.authService.validateOTPNew(userPhone);
    }
    async getUserResponse(req) {
        return this.authService.getUserData({ userId: req.user.sub });
    }
    async refreshAccessToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }
    async logout(id, request) {
        const user = request.user;
        if (user.role === user_role_enum_1.UserRole.ADMIN || user.sub?.toString() === id) {
            return this.authService.revokeToken(id);
        }
        throw new common_1.UnauthorizedException('user does not have enough permissions');
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiResponse)({ type: send_otp_response_dto_1.sendOtpResponseDto }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('request-otp'),
    (0, swagger_1.ApiBody)({
        required: true,
        type: send_otp_request_dto_1.sendOtpRequestDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_otp_request_dto_1.sendOtpRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestOtp", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: user_response_dto_1.UserApiResponseDto }),
    (0, common_1.Post)('validate-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBody)({
        required: true,
        type: verify_phone_request_dto_1.VerifyPhoneRequestDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_phone_request_dto_1.VerifyPhoneRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateOtp", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: user_response_dto_1.UserApiResponseDto }),
    (0, common_1.Post)('validate-otp-new'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBody)({
        required: true,
        type: verify_phone_request_dto_1.VerifyPhoneRequestDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_phone_request_dto_1.VerifyPhoneRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateOtpNew", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: user_response_dto_1.UserApiResponseDto }),
    (0, common_1.Post)('user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserResponse", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: refresh_access_token_request_dto_1.RefreshAccessTokenResponseDto }),
    (0, common_1.Post)('refresh-access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBody)({
        required: true,
        type: refresh_access_token_response_dto_1.RefreshAccessTokenRequestDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_access_token_response_dto_1.RefreshAccessTokenRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshAccessToken", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: refresh_access_token_request_dto_1.RefreshAccessTokenResponseDto }),
    (0, common_1.Post)('logout/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'User ID' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({
        required: true,
        type: refresh_access_token_response_dto_1.RefreshAccessTokenRequestDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, swagger_1.ApiTags)('Auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        otp_flow_service_1.OtpFlowService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map