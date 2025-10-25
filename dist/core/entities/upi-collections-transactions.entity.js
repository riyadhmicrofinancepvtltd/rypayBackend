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
exports.UPICollectionsTransactionMoney = void 0;
const typeorm_1 = require("typeorm");
let UPICollectionsTransactionMoney = class UPICollectionsTransactionMoney {
};
exports.UPICollectionsTransactionMoney = UPICollectionsTransactionMoney;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], UPICollectionsTransactionMoney.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        transformer: {
            to: (value) => Number(value),
            from: (value) => parseFloat(value),
        },
        nullable: true
    }),
    __metadata("design:type", Number)
], UPICollectionsTransactionMoney.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'PENDING', nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UPICollectionsTransactionMoney.prototype, "transaction_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'CREDIT', nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "ifsc", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        nullable: true,
        transformer: {
            to: (value) => Number(value),
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], UPICollectionsTransactionMoney.prototype, "convenience_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "transaction_mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "upi", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPICollectionsTransactionMoney.prototype, "bank_mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], UPICollectionsTransactionMoney.prototype, "data", void 0);
exports.UPICollectionsTransactionMoney = UPICollectionsTransactionMoney = __decorate([
    (0, typeorm_1.Entity)('upi_collections_transaction_money')
], UPICollectionsTransactionMoney);
//# sourceMappingURL=upi-collections-transactions.entity.js.map