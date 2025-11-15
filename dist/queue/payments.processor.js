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
var PaymentsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../core/entities/order.entity");
let PaymentsProcessor = PaymentsProcessor_1 = class PaymentsProcessor {
    constructor(ordersRepo) {
        this.ordersRepo = ordersRepo;
        this.logger = new common_1.Logger(PaymentsProcessor_1.name);
    }
    async handleGenerateReceipt(job) {
        const { transactionId, paymentId, amount } = job.data;
        this.logger.log(`Processing receipt for payment ${paymentId} (transaction ${transactionId})`);
        try {
            job.progress(25);
            const transaction = await this.ordersRepo.findOneBy({ transaction_id: String(transactionId) });
            if (!transaction || transaction.status !== order_entity_1.OrderStatus.SUCCESS.toLowerCase()) {
                throw new Error('Payment not successful yet');
            }
            job.progress(50);
            await new Promise(resolve => setTimeout(resolve, 2000));
            job.progress(75);
            job.progress(100);
            this.logger.log(`Receipt generated for ${paymentId}`);
            return { success: true, receiptId: `rec-${paymentId}` };
        }
        catch (error) {
            this.logger.error(`Failed for ${paymentId}: ${error.message}`);
            throw error;
        }
    }
};
exports.PaymentsProcessor = PaymentsProcessor;
__decorate([
    (0, bull_1.Process)('generate-receipt'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsProcessor.prototype, "handleGenerateReceipt", null);
exports.PaymentsProcessor = PaymentsProcessor = PaymentsProcessor_1 = __decorate([
    (0, bull_1.Processor)('payment-receipts'),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentsProcessor);
//# sourceMappingURL=payments.processor.js.map