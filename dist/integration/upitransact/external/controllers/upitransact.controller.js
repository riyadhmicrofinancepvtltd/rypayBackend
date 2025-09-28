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
exports.PaymentGatewayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_external_service_1 = require("../services/payment-external.service");
const payment_request_dto_1 = require("../dto/payment-request.dto");
const jwt_auth_guard_1 = require("../../../../auth/guards/jwt-auth.guard");
const settlement_history_dto_1 = require("../dto/settlement-history.dto");
const payment_external_client_service_1 = require("../../external-system-client/payment-external-client.service");
let PaymentGatewayController = class PaymentGatewayController {
    constructor(externalService, resellerExternalCLient) {
        this.externalService = externalService;
        this.resellerExternalCLient = resellerExternalCLient;
    }
    async handleKycEvents(req, payload) {
        console.log(`Payment Request Received=======>: ${JSON.stringify(payload)}`);
        return this.externalService.createPaymentRequestOrder(req.user.sub, payload);
    }
    async getMergedData(startDate, endDate, merchantId) {
        return this.resellerExternalCLient.getMergedData(startDate, endDate, merchantId);
    }
    async getTransactionsData(startDate, endDate, merchantId) {
        return this.resellerExternalCLient.getTransactionsData(startDate, endDate, merchantId);
    }
};
exports.PaymentGatewayController = PaymentGatewayController;
__decorate([
    (0, common_1.Post)('payment/request'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_request_dto_1.PaymentRequestDto]),
    __metadata("design:returntype", Promise)
], PaymentGatewayController.prototype, "handleKycEvents", null);
__decorate([
    (0, common_1.Get)('settlements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merged transaction and settlement data' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, example: '01-03-2025' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, example: '17-03-2025' }),
    (0, swagger_1.ApiQuery)({ name: 'merchantId', required: false, example: 'THANDICOFF' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Merged transaction and settlement data',
        type: settlement_history_dto_1.MergedDataResponseDTO,
    }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentGatewayController.prototype, "getMergedData", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merged transactions data' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, example: '01-03-2025' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, example: '17-03-2025' }),
    (0, swagger_1.ApiQuery)({ name: 'merchantId', required: false, example: 'THANDICOFF' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'get merchant transactions',
        type: settlement_history_dto_1.TransactionHistoryDTO,
        isArray: true
    }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentGatewayController.prototype, "getTransactionsData", null);
exports.PaymentGatewayController = PaymentGatewayController = __decorate([
    (0, common_1.Controller)('external'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('External'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payment_external_service_1.PaymentExternalService,
        payment_external_client_service_1.PaymentExternalClientService])
], PaymentGatewayController);
//# sourceMappingURL=upitransact.controller.js.map