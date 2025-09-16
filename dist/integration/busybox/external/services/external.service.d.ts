import { BusyBoxWebhookResponse } from 'src/core/entities/busybox_webhook_logs.entity';
import { Repository } from 'typeorm';
import { TransactionNotifyPayload } from '../interfaces/transaction-notify.interface';
import { WalletService } from 'src/wallet/services/wallet.service';
import { KycWebhookPayload } from '../interfaces/kyc-webhook-payload.interface';
import { UsersService } from 'src/users/services/users.service';
import { TransactionDto } from '../interfaces/upi-transaction-payload.dto';
export declare class ExternalService {
    private busyBoxWebHookRepo;
    private walletService;
    private userService;
    private readonly logger;
    constructor(busyBoxWebHookRepo: Repository<BusyBoxWebhookResponse>, walletService: WalletService, userService: UsersService);
    handleCardtransactions(payload: TransactionNotifyPayload): Promise<{
        message: string;
    }>;
    handleKycEvents(payload: KycWebhookPayload): Promise<{
        message: string;
    }>;
    handleUpiEvents(payload: unknown): Promise<{
        message: string;
    }>;
    handlePayoutEvents(payload: unknown): Promise<{
        message: string;
    }>;
    handleBusyBoxPayoutEvents(payload: any): Promise<{
        message: string;
    }>;
    handleDebitEvents(payload: TransactionDto): Promise<{
        message: string;
    }>;
}
