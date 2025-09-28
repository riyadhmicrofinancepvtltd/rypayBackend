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
var PaymentExternalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentExternalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("../../../../core/entities/order.entity");
const transactions_entity_1 = require("../../../../core/entities/transactions.entity");
const user_entity_1 = require("../../../../core/entities/user.entity");
const hash_util_1 = require("../../../../core/utils/hash.util");
const external_constant_1 = require("../../../busybox/external/constants/external.constant");
const wallet_service_1 = require("../../../../wallet/services/wallet.service");
const typeorm_2 = require("typeorm");
const busybox_webhook_logs_entity_1 = require("../../../../core/entities/busybox_webhook_logs.entity");
const notification_bridge_1 = require("../../../../notifications/services/notification-bridge");
const notification_entity_1 = require("../../../../core/entities/notification.entity");
let PaymentExternalService = PaymentExternalService_1 = class PaymentExternalService {
    constructor(walletService, webHookRepo, orderRepository, notificationBridge, userRepository) {
        this.walletService = walletService;
        this.webHookRepo = webHookRepo;
        this.orderRepository = orderRepository;
        this.notificationBridge = notificationBridge;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(PaymentExternalService_1.name);
    }
    async handlePaymentCallback(requestDto) {
        const webHookResponse = this.webHookRepo.create({
            type: busybox_webhook_logs_entity_1.Webhook_Type.QRPayment,
            additionalData: requestDto
        });
        await this.webHookRepo.save(webHookResponse);
        if (requestDto.data.paymentType === 'Dynamic') {
            await this.dynamicQRHandler(requestDto);
        }
        else {
            await this.staticQRHandler(requestDto);
        }
    }
    async staticQRHandler(requestDto) {
        const mid = requestDto.data.mid;
        const user = await this.userRepository.findOneBy({ merchantPartnerId: mid });
        const notificationEvent = {
            data: {
                user,
                payeeName: requestDto.data.payerName,
                payeeUPIId: requestDto.data.payeeUPI,
                amount: requestDto.data.amount
            },
            type: notification_entity_1.NotificationType.TRANSACTION_CREDIT
        };
        await this.notificationBridge.add('staticQR', notificationEvent);
    }
    async dynamicQRHandler(requestDto) {
        const serviceUsed = 'PaymentGateway';
        const orderId = requestDto.data.merchantReferenceId;
        const order = await this.orderRepository.findOne({ where: { order_id: orderId }, relations: ['user'] });
        if (!order) {
            throw new common_1.BadRequestException('order not found');
        }
        const amount = Number.parseFloat(requestDto.data.amount);
        if (requestDto.txnStatus === 'SUCCESS') {
            const user = order.user;
            await this.walletService.processPaymentGatewaySuccess({ amount: amount,
                receiverId: user.id,
                serviceUsed: serviceUsed,
                description: external_constant_1.PaymentGatewayDescription,
                status: transactions_entity_1.TransactionStatus.SUCCESS,
                reference: orderId }, user.id);
            order.status = order_entity_1.OrderStatus.SUCCESS;
            order.transaction_id = requestDto.data.UTR;
        }
        else {
            order.status = order_entity_1.OrderStatus.FAILED;
        }
        await this.orderRepository.save(order);
        return {
            referenceId: orderId,
            amount: amount,
            message: external_constant_1.PaymentGatewayDescription
        };
    }
    async createPaymentRequestOrder(userId, payload) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('user does not have enough permission');
        }
        const description = payload.message ? payload.message : external_constant_1.PaymentGatewayDescription;
        const orderId = (0, hash_util_1.generateRef)(12);
        const order = {
            order_id: orderId,
            order_type: order_entity_1.OrderType.PAYMENT_GATEWAY,
            gateway_response: '',
            amount: payload.amount,
            status: order_entity_1.OrderStatus.PENDING,
            transaction_id: '',
            user: user,
            description: description,
            payment_method: '',
            paymentMode: 'UPI',
            charges: 0,
            respectiveUserName: `${user.firstName} ${user.lastName}`,
            ifscNumber: "",
            accountId: ""
        };
        const SavedOrder = this.orderRepository.create(order);
        await this.orderRepository.save(SavedOrder);
        return {
            referenceId: SavedOrder.order_id,
            amount: payload.amount,
            message: description
        };
    }
};
exports.PaymentExternalService = PaymentExternalService;
exports.PaymentExternalService = PaymentExternalService = PaymentExternalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(busybox_webhook_logs_entity_1.BusyBoxWebhookResponse)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_bridge_1.NotificationBridge,
        typeorm_2.Repository])
], PaymentExternalService);
//# sourceMappingURL=payment-external.service.js.map