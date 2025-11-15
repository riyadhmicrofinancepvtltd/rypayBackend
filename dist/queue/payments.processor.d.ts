import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Order } from 'src/core/entities/order.entity';
export declare class PaymentsProcessor {
    private ordersRepo;
    private readonly logger;
    constructor(ordersRepo: Repository<Order>);
    handleGenerateReceipt(job: Job<{
        transactionId: number;
        paymentId: string;
        amount: number;
    }>): Promise<{
        success: boolean;
        receiptId: string;
    }>;
}
