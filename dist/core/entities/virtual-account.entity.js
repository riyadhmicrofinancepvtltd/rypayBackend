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
exports.VirtualAccount = void 0;
const typeorm_1 = require("typeorm");
let VirtualAccount = class VirtualAccount {
};
exports.VirtualAccount = VirtualAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], VirtualAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], VirtualAccount.prototype, "accountid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VirtualAccount.prototype, "accountnumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VirtualAccount.prototype, "ifsccode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ACTIVE' }),
    __metadata("design:type", String)
], VirtualAccount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], VirtualAccount.prototype, "createon", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VirtualAccount.prototype, "userid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VirtualAccount.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VirtualAccount.prototype, "transfer_pin", void 0);
exports.VirtualAccount = VirtualAccount = __decorate([
    (0, typeorm_1.Entity)('virtual_accounts')
], VirtualAccount);
//# sourceMappingURL=virtual-account.entity.js.map