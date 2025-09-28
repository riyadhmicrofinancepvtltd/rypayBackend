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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transaction_notify_interface_1 = require("../interfaces/transaction-notify.interface");
const kyc_webhook_payload_interface_1 = require("../interfaces/kyc-webhook-payload.interface");
const external_service_1 = require("../services/external.service");
const upi_transaction_payload_dto_1 = require("../interfaces/upi-transaction-payload.dto");
let ExternalController = class ExternalController {
    constructor(externalService) {
        this.externalService = externalService;
    }
    async handleTransactions(payload) {
        return this.externalService.handleCardtransactions(payload);
    }
    async handleKycEvents(payload) {
        return this.externalService.handleKycEvents(payload);
    }
    async handleDebitEvents(payload) {
        return this.externalService.handleDebitEvents(payload);
    }
    async handleUpiEvents(payload) {
        return this.externalService.handleUpiEvents(payload);
    }
    async handlePayoutEvents(payload) {
        return this.externalService.handlePayoutEvents(payload);
    }
    async handleBusyBoxPayoutEvents(payload, req) {
        return this.externalService.handleBusyBoxPayoutEvents(payload);
    }
};
exports.ExternalController = ExternalController;
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_notify_interface_1.TransactionNotifyPayload]),
    __metadata("design:returntype", Promise)
], ExternalController.prototype, "handleTransactions", null);
__decorate([
    (0, common_1.Post)('kyc-events'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kyc_webhook_payload_interface_1.KycWebhookPayload]),
    __metadata("design:returntype", Promise)
], ExternalController.prototype, "handleKycEvents", null);
__decorate([
    (0, common_1.Post)('debit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upi_transaction_payload_dto_1.TransactionDto]),
    __metadata("design:returntype", Promise)
], ExternalController.prototype, "handleDebitEvents", null);
__decorate([
    (0, common_1.Post)('upi'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upi_transaction_payload_dto_1.TransactionDto]),
    __metadata("design:returntype", Promise)
], ExternalController.prototype, "handleUpiEvents", null);
__decorate([
    (0, common_1.Post)('webhooks/payouts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upi_transaction_payload_dto_1.TransactionDto]),
    __metadata("design:returntype", Promise)
], ExternalController.prototype, "handlePayoutEvents", null);
__decorate([
    (0, common_1.Post)('webhooks/busybox'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExternalController.prototype, "handleBusyBoxPayoutEvents", null);
exports.ExternalController = ExternalController = __decorate([
    (0, common_1.Controller)('external'),
    (0, swagger_1.ApiTags)('External'),
    __metadata("design:paramtypes", [external_service_1.ExternalService])
], ExternalController);
//# sourceMappingURL=external.controller.js.map