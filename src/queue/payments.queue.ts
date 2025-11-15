// queue/payments-queue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from 'src/core/entities/order.entity';
// import { TransactionEntity } from '../entities/transaction.entity'; // Adjust path

@Injectable()
export class PaymentsQueueService {
  constructor(
    @InjectQueue('payment-receipts') private receiptsQueue: Queue,
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
  ) {}

  async pushPendingReceipt(transactionId: number, paymentData: { paymentId: string; amount: number }) {
    const job = await this.receiptsQueue.add('generate-receipt', {
      transactionId,
      ...paymentData,
    });

    // Store job ID in DB
    const transaction = await this.ordersRepo.findOneBy({ transaction_id: String(transactionId) });
    if (transaction) {
      transaction.transaction_id = job.id.toString();
      await this.ordersRepo.save(transaction);
    }

    return job.id;
  }

  async updateReceiptJob(transactionId: number, newStatus: 'success') {
    const transaction = await this.ordersRepo.findOneBy({ transaction_id: String(transactionId) });
    if (transaction && transaction.transaction_id) {
      const job = await this.receiptsQueue.getJob(parseInt(transaction.transaction_id, 10));
      if (job) {
        await job.update({ ...job.data, status: newStatus });
        await job.promote();

        // Update DB status
        transaction.status = OrderStatus.SUCCESS;
        await this.ordersRepo.save(transaction);
      }
    }
  }
}