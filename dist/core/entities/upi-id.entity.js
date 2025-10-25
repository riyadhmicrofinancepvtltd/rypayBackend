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
exports.UPIIds = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UPIIds = class UPIIds {
};
exports.UPIIds = UPIIds;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], UPIIds.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UPIIds.prototype, "accountid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UPIIds.prototype, "accountnumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UPIIds.prototype, "vpaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPIIds.prototype, "ifsccode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ACTIVE' }),
    __metadata("design:type", String)
], UPIIds.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], UPIIds.prototype, "createon", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UPIIds.prototype, "userid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UPIIds.prototype, "upiId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UPIIds.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPIIds.prototype, "transfer_pin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UPIIds.prototype, "upiQr", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.upiIds, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userid' }),
    __metadata("design:type", user_entity_1.User)
], UPIIds.prototype, "user", void 0);
exports.UPIIds = UPIIds = __decorate([
    (0, typeorm_1.Entity)('upi_ids')
], UPIIds);
//# sourceMappingURL=upi-id.entity.js.map