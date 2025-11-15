"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const payments_processor_1 = require("./payments.processor");
const payments_queue_1 = require("./payments.queue");
const dashboard_controller_1 = require("./dashboard.controller");
const order_entity_1 = require("../core/entities/order.entity");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'payment-receipts',
            }),
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order]),
        ],
        providers: [payments_processor_1.PaymentsProcessor, payments_queue_1.PaymentsQueueService],
        controllers: [dashboard_controller_1.DashboardController],
        exports: [payments_queue_1.PaymentsQueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map