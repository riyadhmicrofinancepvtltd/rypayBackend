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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_entity_1 = require("../../core/entities/user.entity");
const kyc_status_dto_1 = require("../dto/kyc-status.dto");
const phone_number_exists_dto_1 = require("../dto/phone-number-exists.dto");
const pin_request_dto_1 = require("../dto/pin-request.dto");
const virtual_account_request_dto_1 = require("../dto/virtual-account-request.dto");
const user_kyc_upload_dto_1 = require("../dto/user-kyc-upload.dto");
const user_request_dto_1 = require("../dto/user-request.dto");
const user_response_dto_1 = require("../dto/user-response.dto");
const validate_aadhar_dto_1 = require("../dto/validate-aadhar.dto");
const updaload_file_service_1 = require("../services/updaload-file.service");
const users_service_1 = require("../services/users.service");
let UsersController = class UsersController {
    constructor(userService, uploadFileService) {
        this.userService = userService;
        this.uploadFileService = uploadFileService;
    }
    async register(signUpDto) {
        return this.userService.registerUserAndGenerateToken(signUpDto);
    }
    async requestAadharOtp(aadharNumber) {
        return this.userService.requestAadharOtp(aadharNumber);
    }
    async validateAadharOtp(body) {
        return this.userService.validateAadharOtp(body);
    }
    async deleteUser(req) {
        return this.userService.deleteUser(req.user.sub);
    }
    async getUserDetail(req) {
        return this.userService.getUserDetail(req.user.sub);
    }
    async registerAdmin(signUpDto) {
        return this.userService.registerAdminAndGenerateToken(signUpDto);
    }
    async updateUser(userId, updateDto) {
        return this.userService.updateUserProfile(userId, updateDto);
    }
    async getAllUser(req, search) {
        return this.userService.getAllUsers(req.user.sub, search);
    }
    async checkUserExist(phoneNumber) {
        return this.userService.checkPhoneNumberExists(phoneNumber);
    }
    async updateProfileIcon(file, req) {
        return this.userService.updateProfileIcon(req.user.sub, file);
    }
    async updateStaticQR(userId, file, merchantId) {
        return this.userService.updateStaticQR(userId, merchantId, file);
    }
    async setPin(req, pinRequest) {
        await this.userService.setPin(req.user.sub, pinRequest.pin);
        return {
            message: 'pin created successfully'
        };
    }
    async createVirtualAccount(req, virtualRequest) {
        let data = await this.userService.createVirtualAccount(req.user.sub, virtualRequest.customer_name, virtualRequest.email, virtualRequest.phoneNumber);
        return data;
    }
    async getVirtualAccount(req) {
        let data = await this.userService.getVirtualAccount(req.user.sub);
        return data;
    }
    async verifyPin(req, pinRequest) {
        const valid = await this.userService.verifyPin(req.user.sub, pinRequest.pin);
        return { valid };
    }
    async requestResetPin(req) {
        await this.userService.sendVerificationCode(req.user.sub);
        return { message: 'Verification code sent to your email.' };
    }
    async updateForgotPin(req, body) {
        return await this.userService.verifyCodeAndUpdateUserPin(req.user.sub, body.otp, body.newPin);
    }
    async updateKYC(req, kycStatus) {
        return this.userService.updateUserKycStatus(req.user.sub, kycStatus);
    }
    async getKYCInitiatedUsers(kycStatus) {
        return this.userService.getUsersByKycStatus(kycStatus);
    }
    async getUserStaticQR(req) {
        return this.userService.getUserStaticQR(req.user.sub);
    }
    async getKycStatusOfUser(req) {
        const status = await this.userService.getKycStatusOfUser(req.user.sub);
        return {
            status
        };
    }
    async validateCard(req, otpRequest) {
        const cardDetails = await this.userService.validateUserCardAssignment(req.user.sub, otpRequest.otp);
        return {
            isVerified: true,
            cardDetails
        };
    }
    async getMyDocuments(req) {
        const userDocuments = await this.userService.getUserDocuments(req.user.sub);
        return {
            data: userDocuments
        };
    }
    async uploadFile(file) {
        const fileData = await this.uploadFileService.uploadSingleFile(file);
        return fileData;
    }
    async getUserProfile(userId) {
        const fileData = await this.userService.getUserProfile(userId);
        return fileData;
    }
    async updateKYCDocument(req, userDocsInfo) {
        const fileData = await this.userService.updateUserKycDetails(req.user.sub, userDocsInfo);
        return {
            success: !!fileData
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to register the user' }),
    (0, common_1.Post)('/signup'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        type: user_response_dto_1.UserApiResponseDto,
        description: 'The record has been successfully created.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_request_dto_1.UserRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to request the aadhar otp' }),
    (0, common_1.Post)('/request-aadhar-otp/:aadharNumber'),
    (0, swagger_1.ApiParam)({
        type: 'string',
        name: 'aadharNumber'
    }),
    __param(0, (0, common_1.Param)('aadharNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "requestAadharOtp", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to validate the aadhar otp' }),
    (0, common_1.Post)('/validate-aadhar-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_aadhar_dto_1.ValidateAadharDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "validateAadharOtp", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to delete the user' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        type: user_response_dto_1.UserApiResponseDto,
        description: 'The record has been successfully deleted.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'forbidden exception',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current user details' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User details fetched successfully',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserDetail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to register the user as Admin' }),
    (0, common_1.Post)('/signup/admin'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        type: user_response_dto_1.UserApiResponseDto,
        description: 'The record has been successfully created.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_request_dto_1.UserAdminRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "registerAdmin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to update user profile' }),
    (0, common_1.Post)('/update/user/:userId'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        type: user_entity_1.User,
        description: 'The record has been successfully created.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_request_dto_1.UserUpdateRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to get all users' }),
    (0, common_1.Post)('/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        type: [user_response_dto_1.UserResponse],
        description: 'The record has been successfully retrieved.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to check phone number exist' }),
    (0, common_1.Post)('/exist/:phoneNumber'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        type: phone_number_exists_dto_1.PhoneNumberExists,
        description: 'Returns if phone number exist.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Param)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkUserExist", null);
__decorate([
    (0, common_1.Put)('update-profile-icon'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile icon' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile icon updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'File to upload and user ID',
        type: 'multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: (10 * 1024 * 1024),
                message: 'File is too large. Max file size is 10MB',
            }),
        ],
        fileIsRequired: true,
    }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfileIcon", null);
__decorate([
    (0, common_1.Put)('update-static-qr/:userId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update static QR' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Static QR uploaded successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'File to upload, user ID, and merchant ID',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                merchantId: {
                    type: 'string',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: 10 * 1024 * 1024,
                message: 'File is too large. Max file size is 10MB',
            }),
        ],
        fileIsRequired: true,
    }))),
    __param(2, (0, common_1.Body)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStaticQR", null);
__decorate([
    (0, common_1.Post)('set-pin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pin_request_dto_1.PinRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setPin", null);
__decorate([
    (0, common_1.Post)('create-virtual-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, virtual_account_request_dto_1.VirtualAccountRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createVirtualAccount", null);
__decorate([
    (0, common_1.Get)('get-virtual-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getVirtualAccount", null);
__decorate([
    (0, common_1.Post)('verify-pin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pin_request_dto_1.PinRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyPin", null);
__decorate([
    (0, common_1.Post)('reset-pin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Request PIN reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification code sent to user.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "requestResetPin", null);
__decorate([
    (0, common_1.Post)('forgot/update-pin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'updates pin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Code verified successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid code or expired.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pin_request_dto_1.UpdateForgotPin]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateForgotPin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to initiate kyc of the user' }),
    (0, common_1.Put)('/kyc-status'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        type: 'string',
        description: 'The record has been successfully updated.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateKYC", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to get list of users based on kyc status' }),
    (0, common_1.Get)('/kyc/:kycStatus'),
    (0, swagger_1.ApiParam)({ name: 'kycStatus', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        type: (Array),
        description: 'The list of users based on given kyc status.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Param)('kycStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getKYCInitiatedUsers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to get Static QR code' }),
    (0, common_1.Get)('/staticQR'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'get Static QR code.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStaticQR", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to get kyc status of user' }),
    (0, common_1.Get)('/kyc'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        type: kyc_status_dto_1.KycVerificationStatusResponse,
        description: 'The kyc status of user.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Forbidden.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request exception',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getKycStatusOfUser", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to validate otp for card after card creation' }),
    (0, common_1.Post)('/validate/card'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_request_dto_1.ValidateOTPAfterCardCreationDTO]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "validateCard", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to get my documents' }),
    (0, common_1.Get)('/documents'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyDocuments", null);
__decorate([
    (0, common_1.Post)('/upload/documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to upload user documents /n Max size of the file is 10 MB' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({
                maxSize: (10 * 1024 * 1024),
                message: 'File is too large. Max file size is 10MB',
            }),
        ],
        fileIsRequired: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':userid'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint to get user profile data, ADMIN' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Unique ID of the user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User details retrieved successfully',
        type: user_response_dto_1.UserResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Param)('userid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Post)('/KYC/document'),
    (0, swagger_1.ApiOperation)({ summary: 'Update KYC documents for users' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({
        description: 'Array of KYC document update information',
        type: [user_kyc_upload_dto_1.UpdateKycDetailUploadDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documents updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal Server Error' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateKYCDocument", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('user'),
    (0, swagger_1.ApiTags)('User'),
    __metadata("design:paramtypes", [users_service_1.UsersService, updaload_file_service_1.UploadFileService])
], UsersController);
//# sourceMappingURL=user.controller.js.map