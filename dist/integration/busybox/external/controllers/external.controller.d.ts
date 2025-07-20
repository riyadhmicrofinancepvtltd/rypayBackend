import { TransactionNotifyPayload } from '../interfaces/transaction-notify.interface';
import { KycWebhookPayload } from '../interfaces/kyc-webhook-payload.interface';
import { ExternalService } from '../services/external.service';
import { TransactionDto } from '../interfaces/upi-transaction-payload.dto';
export declare class ExternalController {
    private externalService;
    constructor(externalService: ExternalService);
    handleTransactions(payload: TransactionNotifyPayload): Promise<{
        message: string;
    }>;
    handleKycEvents(payload: KycWebhookPayload): Promise<{
        message: string;
    }>;
    handleDebitEvents(payload: TransactionDto): Promise<{
        message: string;
    }>;
    handleUpiEvents(payload: TransactionDto): Promise<{
        message: string;
    }>;
    handlePayoutEvents(payload: TransactionDto): Promise<{
        message: string;
    }>;
    handleBusyBoxPayoutEvents(payload: TransactionDto): Promise<{
        message: string;
    }>;
}
