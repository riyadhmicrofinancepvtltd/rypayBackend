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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const kyc_verification_status_enum_1 = require("../enum/kyc-verification-status.enum");
const document_entity_1 = require("./document.entity");
const user_role_enum_1 = require("../enum/user-role.enum");
const address_entity_1 = require("./address.entity");
const merchant_entity_1 = require("./merchant.entity");
const order_entity_1 = require("./order.entity");
const card_entity_1 = require("./card.entity");
const beneficiery_entity_1 = require("./beneficiery.entity");
const notification_entity_1 = require("./notification.entity");
const loan_entity_1 = require("./loan.entity");
const money_request_entity_1 = require("./money-request.entity");
const coins_entity_1 = require("./coins.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', unique: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'aadhar_number', type: 'varchar', unique: true }),
    __metadata("design:type", String)
], User.prototype, "aadharNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pan_number', type: 'varchar', unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "panNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_kyc_verified', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "kycVerificationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', type: 'char', default: 'M' }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_holder_id', type: 'varchar', unique: true }),
    __metadata("design:type", String)
], User.prototype, "cardHolderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => document_entity_1.UserDocument, (document) => document.user),
    __metadata("design:type", Array)
], User.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name' }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name' }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dob' }),
    __metadata("design:type", String)
], User.prototype, "dob", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reason' }),
    __metadata("design:type", String)
], User.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => address_entity_1.Address, (add) => add.id, { cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'address_id' }),
    __metadata("design:type", address_entity_1.Address)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => card_entity_1.Card, card => card.user),
    __metadata("design:type", card_entity_1.Card)
], User.prototype, "card", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.user),
    __metadata("design:type", Array)
], User.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => beneficiery_entity_1.Beneficiary, beneficiary => beneficiary.user),
    __metadata("design:type", Array)
], User.prototype, "beneficiaries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pin', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "pin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profileIcon', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileIcon", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'staticQR', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "staticQR", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referralCode', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "referralCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user-session', nullable: true, default: "YES" }),
    __metadata("design:type", String)
], User.prototype, "userSession", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => merchant_entity_1.Merchant, (merchant) => merchant.id, { cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'merchant_id' }),
    __metadata("design:type", merchant_entity_1.Merchant)
], User.prototype, "merchant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchantPartnerId', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "merchantPartnerId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => coins_entity_1.CoinTransaction, (coinTransactions) => coinTransactions.user),
    __metadata("design:type", Array)
], User.prototype, "coinTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user-devices', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "mobileDevices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => loan_entity_1.Loan, (loan) => loan.user),
    __metadata("design:type", Array)
], User.prototype, "loans", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => money_request_entity_1.MoneyRequest, (moneyRequest) => moneyRequest.user),
    __metadata("design:type", Array)
], User.prototype, "moneyRequest", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], User);
//# sourceMappingURL=user.entity.js.map