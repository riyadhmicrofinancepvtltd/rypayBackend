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
exports.ValidateOTPAfterCardCreationDTO = exports.UserUpdateResponse = exports.UserUpdateRequestDto = exports.UserAdminRequestDto = exports.UserRequestDto = exports.UserRequestCommonDto = exports.AddressRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_role_enum_1 = require("../../core/enum/user-role.enum");
const merchecnt_request_dto_1 = require("./merchecnt-request.dto");
const kyc_verification_status_enum_1 = require("../../core/enum/kyc-verification-status.enum");
class AddressRequestDto {
}
exports.AddressRequestDto = AddressRequestDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(10, 200),
    __metadata("design:type", String)
], AddressRequestDto.prototype, "address1", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(10, 200),
    __metadata("design:type", String)
], AddressRequestDto.prototype, "address2", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AddressRequestDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AddressRequestDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(5, 10),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AddressRequestDto.prototype, "pincode", void 0);
class UserRequestCommonDto {
}
exports.UserRequestCommonDto = UserRequestCommonDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ description: 'first name' }),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['M', 'F']),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)('IN'),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "fcmToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "otp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "otpSessionId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "dob", void 0);
__decorate([
    (0, class_validator_1.Validate)(AddressRequestDto),
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", AddressRequestDto)
], UserRequestCommonDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsIn)([user_role_enum_1.UserRole.MERCHANT, user_role_enum_1.UserRole.USER]),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/[A-Z]{5}[0-9]{4}[A-Z]{1}/),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "panNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(12),
    __metadata("design:type", String)
], UserRequestCommonDto.prototype, "aadharNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Validate)(merchecnt_request_dto_1.MerchantRequestDto),
    __metadata("design:type", merchecnt_request_dto_1.MerchantRequestDto)
], UserRequestCommonDto.prototype, "merchantInfo", void 0);
class UserRequestDto extends UserRequestCommonDto {
}
exports.UserRequestDto = UserRequestDto;
__decorate([
    (0, class_validator_1.IsIn)([user_role_enum_1.UserRole.MERCHANT, user_role_enum_1.UserRole.USER]),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRequestDto.prototype, "referrelCode", void 0);
class UserAdminRequestDto extends UserRequestCommonDto {
}
exports.UserAdminRequestDto = UserAdminRequestDto;
__decorate([
    (0, class_validator_1.IsIn)([user_role_enum_1.UserRole.ADMIN]),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserAdminRequestDto.prototype, "userType", void 0);
class UserUpdateRequestDto extends UserRequestCommonDto {
}
exports.UserUpdateRequestDto = UserUpdateRequestDto;
__decorate([
    (0, class_validator_1.IsIn)([user_role_enum_1.UserRole.MERCHANT, user_role_enum_1.UserRole.USER]),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserUpdateRequestDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], UserUpdateRequestDto.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], UserUpdateRequestDto.prototype, "kycVerificationStatus", void 0);
class UserUpdateResponse {
}
exports.UserUpdateResponse = UserUpdateResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserUpdateResponse.prototype, "success", void 0);
class ValidateOTPAfterCardCreationDTO {
}
exports.ValidateOTPAfterCardCreationDTO = ValidateOTPAfterCardCreationDTO;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ValidateOTPAfterCardCreationDTO.prototype, "otp", void 0);
//# sourceMappingURL=user-request.dto.js.map