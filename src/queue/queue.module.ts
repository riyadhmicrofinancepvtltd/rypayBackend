// queue/queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsProcessor } from './payments.processor';
import { PaymentsQueueService } from './payments.queue';
import { DashboardController } from './dashboard.controller';
import { Order } from 'src/core/entities/order.entity';
// import { TransactionEntity } from '../entities/transaction.entity'; // Adjust path if needed

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payment-receipts',
    }),
    TypeOrmModule.forFeature([Order /*, other entities if needed */]),
  ],
  providers: [PaymentsProcessor, PaymentsQueueService],
  controllers: [DashboardController],
  exports: [PaymentsQueueService], // Export service for use in other modules
})
export class QueueModule {}