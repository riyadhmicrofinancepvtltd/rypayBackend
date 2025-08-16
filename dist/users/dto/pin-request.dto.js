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
exports.deleteUserAccountDto = exports.UpdateTransactionPinDto = exports.TransactionPinRequestDto = exports.UpdateForgotPin = exports.PinRequestDto = void 0;
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
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], deleteUserAccountDto.prototype, "lockPin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], deleteUserAccountDto.prototype, "reason", void 0);
//# sourceMappingURL=pin-request.dto.js.map