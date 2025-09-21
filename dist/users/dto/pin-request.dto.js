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
exports.ScratchRewardRequestDto = exports.PaymentStatusRequestDto = exports.CreateOrderRequestDto = exports.SendMoneyRequestDto = exports.ToContactRequestDto = exports.deleteUserAccountDto = exports.UpdateTransactionPinDto = exports.TransactionPinRequestDto = exports.UpdateForgotPin = exports.PinRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PinRequestDto {
}
exports.PinRequestDto = PinRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(4, 4),
    __metadata("design:type", String)
], PinRequestDto.prototype, "pin", void 0);
class UpdateForgotPin {
}
exports.UpdateForgotPin = UpdateForgotPin;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(4, 4),
    __metadata("design:type", String)
], UpdateForgotPin.prototype, "newPin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateForgotPin.prototype, "otp", void 0);
class TransactionPinRequestDto {
}
exports.TransactionPinRequestDto = TransactionPinRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], TransactionPinRequestDto.prototype, "transferPin", void 0);
class UpdateTransactionPinDto {
}
exports.UpdateTransactionPinDto = UpdateTransactionPinDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], UpdateTransactionPinDto.prototype, "newTransferPin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTransactionPinDto.prototype, "otp", void 0);
class deleteUserAccountDto {
}
exports.deleteUserAccountDto = deleteUserAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Length)(4, 4),
    __metadata("design:type", String)
], deleteUserAccountDto.prototype, "lockPin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], deleteUserAccountDto.prototype, "reason", void 0);
class ToContactRequestDto {
}
exports.ToContactRequestDto = ToContactRequestDto;
class SendMoneyRequestDto {
}
exports.SendMoneyRequestDto = SendMoneyRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "paymentMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SendMoneyRequestDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "transactionPIN", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "upiUserName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "ifsc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['IMPS', 'RTGS', 'NEFT']),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMoneyRequestDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SendMoneyRequestDto.prototype, "convenienceFee", void 0);
class CreateOrderRequestDto {
}
exports.CreateOrderRequestDto = CreateOrderRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateOrderRequestDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "customer_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "customer_mobile", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "customer_email", void 0);
class PaymentStatusRequestDto {
}
exports.PaymentStatusRequestDto = PaymentStatusRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PaymentStatusRequestDto.prototype, "order_id", void 0);
class ScratchRewardRequestDto {
}
exports.ScratchRewardRequestDto = ScratchRewardRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ScratchRewardRequestDto.prototype, "reward_id", void 0);
//# sourceMappingURL=pin-request.dto.js.map