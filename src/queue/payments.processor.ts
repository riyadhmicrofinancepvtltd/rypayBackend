    // queue/payments.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from 'src/core/entities/order.entity';

@Processor('payment-receipts') // One by one
export class PaymentsProcessor {
  private readonly logger = new Logger(PaymentsProcessor.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
  ) {}

  @Process('generate-receipt')
  async handleGenerateReceipt(job: Job<{ transactionId: number; paymentId: string; amount: number }>) {
    const { transactionId, paymentId, amount } = job.data;
    this.logger.log(`Processing receipt for payment ${paymentId} (transaction ${transactionId})`);

    try {
      job.progress(25); // Starting...

      // DB check: Get latest status
      const transaction = await this.ordersRepo.findOneBy({ transaction_id: String(transactionId) });
      if (!transaction || transaction.status !== OrderStatus.SUCCESS.toLowerCase()) {
        throw new Error('Payment not successful yet');
      }

      job.progress(50); // Generating...

      // Generate receipt (e.g., PDF logic here; simulate delay)
      await new Promise(resolve => setTimeout(resolve, 2000));

      job.progress(75); // Updating DB...

      // Update DB: Mark as receipt generated
      // transaction.receiptGenerated = true; // Assume field exists; add migration if needed
      // await this.transactionRepo.save(transaction);

      job.progress(100); // Done!

      this.logger.log(`Receipt generated for ${paymentId}`);
      return { success: true, receiptId: `rec-${paymentId}` };
    } catch (error) {
      this.logger.error(`Failed for ${paymentId}: ${error.message}`);
      throw error; // Fails job, visible in dashboard
    }
  }
}