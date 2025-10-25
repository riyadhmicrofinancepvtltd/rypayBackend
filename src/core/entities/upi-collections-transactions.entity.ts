
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('upi_collections_transaction_money')
export class UPICollectionsTransactionMoney {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column('decimal', {
    transformer: {
      to: (value: number | string) => Number(value),   // always store as number
      from: (value: string) => parseFloat(value),      // convert DB string → number
    }
    , nullable: true
  })
  amount: number;

  @Column({ default: 'PENDING', nullable: true })
  status: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  transaction_date: Date;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ nullable: true })
  reference: string;   // ✅ added

  @Column({ nullable: true })
  message: string;

  @Column({ default: 'CREDIT', nullable: true })
  type: string;

  @Column({ nullable: true })
  bank: string;

  @Column({ nullable: true })
  ifsc: string;


  @Column('decimal', {
    nullable: true,
    transformer: {
      to: (value: number | string) => Number(value),   // always store as number
      from: (value: string) => parseFloat(value),      // convert DB string → number
    }
  })
  convenience_fee: number;


  @Column({ nullable: true })
  transaction_mode: string;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  upi: string;


  @Column({ nullable: true })
  bank_mode: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;


}
