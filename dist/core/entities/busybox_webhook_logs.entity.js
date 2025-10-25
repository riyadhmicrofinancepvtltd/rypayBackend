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
exports.BusyBoxWebhookResponse = exports.Webhook_Type = void 0;
const typeorm_1 = require("typeorm");
var Webhook_Type;
(function (Webhook_Type) {
    Webhook_Type["KYC_EVENT"] = "KYC_EVENT";
    Webhook_Type["TRANSACTION"] = "TRANSACTION";
    Webhook_Type["UPI"] = "UPI";
    Webhook_Type["DEBIT"] = "DEBIT";
    Webhook_Type["Payout"] = "PAYOUT";
    Webhook_Type["QRPayment"] = "QR_Payment";
    Webhook_Type["UPI_COLLECTION"] = "UPI_COLLECTION";
})(Webhook_Type || (exports.Webhook_Type = Webhook_Type = {}));
let BusyBoxWebhookResponse = class BusyBoxWebhookResponse {
};
exports.BusyBoxWebhookResponse = BusyBoxWebhookResponse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusyBoxWebhookResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Webhook_Type,
        default: Webhook_Type.TRANSACTION
    }),
    __metadata("design:type", String)
], BusyBoxWebhookResponse.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BusyBoxWebhookResponse.prototype, "additionalData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], BusyBoxWebhookResponse.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], BusyBoxWebhookResponse.prototype, "updatedAt", void 0);
exports.BusyBoxWebhookResponse = BusyBoxWebhookResponse = __decorate([
    (0, typeorm_1.Entity)('busybox_webhook_responses')
], BusyBoxWebhookResponse);
//# sourceMappingURL=busybox_webhook_logs.entity.js.map