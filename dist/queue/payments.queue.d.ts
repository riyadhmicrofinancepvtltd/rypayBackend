import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { Order } from 'src/core/entities/order.entity';
export declare class PaymentsQueueService {
    private receiptsQueue;
    private ordersRepo;
    constructor(receiptsQueue: Queue, ordersRepo: Repository<Order>);
    pushPendingReceipt(transactionId: number, paymentData: {
        paymentId: string;
        amount: number;
    }): Promise<import("bull").JobId>;
    updateReceiptJob(transactionId: number, newStatus: 'success'): Promise<void>;
}
