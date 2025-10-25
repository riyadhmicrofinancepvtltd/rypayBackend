import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Webhook_Type {
    KYC_EVENT = 'KYC_EVENT',
    TRANSACTION = 'TRANSACTION',
    UPI = 'UPI',
    DEBIT = 'DEBIT',
    Payout = 'PAYOUT',
    QRPayment = 'QR_Payment',
    UPI_COLLECTION = 'UPI_COLLECTION'
  }

@Entity('busybox_webhook_responses')
export class BusyBoxWebhookResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Webhook_Type,
    default: Webhook_Type.TRANSACTION
  })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
