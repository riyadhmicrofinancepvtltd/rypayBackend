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
exports.TransactionMoney = void 0;
const typeorm_1 = require("typeorm");
let TransactionMoney = class TransactionMoney {
};
exports.TransactionMoney = TransactionMoney;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], TransactionMoney.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        transformer: {
            to: (value) => Number(value),
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], TransactionMoney.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'PENDING' }),
    __metadata("design:type", String)
], TransactionMoney.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TransactionMoney.prototype, "transaction_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'CREDIT' }),
    __metadata("design:type", String)
], TransactionMoney.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "ifsc", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        transformer: {
            to: (value) => Number(value),
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], TransactionMoney.prototype, "convenience_fee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "transaction_mode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "upi", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionMoney.prototype, "bank_mode", void 0);
exports.TransactionMoney = TransactionMoney = __decorate([
    (0, typeorm_1.Entity)('transaction_money')
], TransactionMoney);
//# sourceMappingURL=transaction-money.entity.js.map