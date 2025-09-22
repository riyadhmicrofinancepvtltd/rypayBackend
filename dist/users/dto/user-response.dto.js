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
exports.UserApiResponseDto = exports.AddressDto = exports.UserResponse = exports.AccountResponse = exports.CardResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
const token_response_dto_1 = require("../../auth/dto/token-response.dto");
const address_entity_1 = require("../../core/entities/address.entity");
const merchant_entity_1 = require("../../core/entities/merchant.entity");
const wallet_entity_1 = require("../../core/entities/wallet.entity");
const kyc_verification_status_enum_1 = require("../../core/enum/kyc-verification-status.enum");
class CardResponse {
    constructor(card) {
        if (card) {
            this.cardId = card.cardNumber;
            this.status = card.status;
            this.lastFourDigit = card.lastFourDigits;
        }
    }
}
exports.CardResponse = CardResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CardResponse.prototype, "cardId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CardResponse.prototype, "lastFourDigit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CardResponse.prototype, "status", void 0);
class AccountResponse {
    constructor(user) {
        if (user) {
            this.accountNumber = '1005896487';
            this.ifscCode = 'YESB012455';
            this.nameInBank = `${user.firstName} ${user.lastName}`;
            this.upi = '8168938167@ptsbi';
        }
    }
}
exports.AccountResponse = AccountResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountResponse.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountResponse.prototype, "ifscCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountResponse.prototype, "nameInBank", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountResponse.prototype, "upi", void 0);
class UserResponse {
    constructor(user) {
        this.userid = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.fullName = user.fullName;
        this.email = user.email;
        this.dob = user.dob;
        this.userRole = user.role;
        this.address = user.address;
        this.merchant = user.merchant;
        this.aadharNumber = user.aadharNumber;
        this.panNumber = user.panNumber;
        this.isBlocked = !!user.isBlocked;
        this.phoneNumber = user.phoneNumber;
        this.merchantPartnerId = user.merchantPartnerId;
        this.kycVerificationStatus = kyc_verification_status_enum_1.KycVerificationStatus[user.kycVerificationStatus].toString();
        this.isPinCreated = !!user.pin;
        this.cardDetails = new CardResponse(user.card);
        this.accountDetails = new AccountResponse(user);
        this.referrelCode = user.referralCode;
    }
}
exports.UserResponse = UserResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "userid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserResponse.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "userRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", address_entity_1.Address)
], UserResponse.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", wallet_entity_1.Wallet)
], UserResponse.prototype, "wallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "kycVerificationStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserResponse.prototype, "isPinCreated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", CardResponse)
], UserResponse.prototype, "cardDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "profileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "staticQRUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "aadharNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "panNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "merchantPartnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponse.prototype, "referrelCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AccountResponse)
], UserResponse.prototype, "accountDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", merchant_entity_1.Merchant)
], UserResponse.prototype, "merchant", void 0);
class AddressDto {
}
exports.AddressDto = AddressDto;
class UserApiResponseDto {
}
exports.UserApiResponseDto = UserApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", UserResponse)
], UserApiResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", token_response_dto_1.TokenResponse)
], UserApiResponseDto.prototype, "tokens", void 0);
//# sourceMappingURL=user-response.dto.js.map