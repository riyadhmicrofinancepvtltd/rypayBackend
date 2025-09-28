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
exports.ExternalPaymentGatewayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_payload_dto_1 = require("../dto/webhook-payload.dto");
const payment_external_service_1 = require("../services/payment-external.service");
let ExternalPaymentGatewayController = class ExternalPaymentGatewayController {
    constructor(externalService) {
        this.externalService = externalService;
    }
    async handleKycEvents(payload) {
        console.log(`Payment Callback Received==test=======>: ${JSON.stringify(payload)}`);
        return this.externalService.handlePaymentCallback(payload);
    }
};
exports.ExternalPaymentGatewayController = ExternalPaymentGatewayController;
__decorate([
    (0, common_1.Post)('payment'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webhook_payload_dto_1.WebhookPaymentRequestDto]),
    __metadata("design:returntype", Promise)
], ExternalPaymentGatewayController.prototype, "handleKycEvents", null);
exports.ExternalPaymentGatewayController = ExternalPaymentGatewayController = __decorate([
    (0, common_1.Controller)('external'),
    (0, swagger_1.ApiTags)('External'),
    __metadata("design:paramtypes", [payment_external_service_1.PaymentExternalService])
], ExternalPaymentGatewayController);
//# sourceMappingURL=upitransact-external.controller.js.map