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
exports.PaymentsQueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../core/entities/order.entity");
let PaymentsQueueService = class PaymentsQueueService {
    constructor(receiptsQueue, ordersRepo) {
        this.receiptsQueue = receiptsQueue;
        this.ordersRepo = ordersRepo;
    }
    async pushPendingReceipt(transactionId, paymentData) {
        const job = await this.receiptsQueue.add('generate-receipt', {
            transactionId,
            ...paymentData,
        });
        const transaction = await this.ordersRepo.findOneBy({ transaction_id: String(transactionId) });
        if (transaction) {
            transaction.transaction_id = job.id.toString();
            await this.ordersRepo.save(transaction);
        }
        return job.id;
    }
    async updateReceiptJob(transactionId, newStatus) {
        const transaction = await this.ordersRepo.findOneBy({ transaction_id: String(transactionId) });
        if (transaction && transaction.transaction_id) {
            const job = await this.receiptsQueue.getJob(parseInt(transaction.transaction_id, 10));
            if (job) {
                await job.update({ ...job.data, status: newStatus });
                await job.promote();
                transaction.status = order_entity_1.OrderStatus.SUCCESS;
                await this.ordersRepo.save(transaction);
            }
        }
    }
};
exports.PaymentsQueueService = PaymentsQueueService;
exports.PaymentsQueueService = PaymentsQueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('payment-receipts')),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository])
], PaymentsQueueService);
//# sourceMappingURL=payments.queue.js.map