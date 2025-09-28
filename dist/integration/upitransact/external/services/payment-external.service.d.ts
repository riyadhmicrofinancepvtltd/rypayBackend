import { Order } from 'src/core/entities/order.entity';
import { User } from 'src/core/entities/user.entity';
import { WalletService } from 'src/wallet/services/wallet.service';
import { Repository } from 'typeorm';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { WebhookPaymentRequestDto } from '../dto/webhook-payload.dto';
import { BusyBoxWebhookResponse } from 'src/core/entities/busybox_webhook_logs.entity';
import { NotificationBridge } from 'src/notifications/services/notification-bridge';
export declare class PaymentExternalService {
    private walletService;
    private webHookRepo;
    private orderRepository;
    private readonly notificationBridge;
    private userRepository;
    private readonly logger;
    constructor(walletService: WalletService, webHookRepo: Repository<BusyBoxWebhookResponse>, orderRepository: Repository<Order>, notificationBridge: NotificationBridge, userRepository: Repository<User>);
    handlePaymentCallback(requestDto: WebhookPaymentRequestDto): Promise<void>;
    private staticQRHandler;
    private dynamicQRHandler;
    createPaymentRequestOrder(userId: string, payload: PaymentRequestDto): Promise<{
        referenceId: string;
        amount: number;
        message: string;
    }>;
}
