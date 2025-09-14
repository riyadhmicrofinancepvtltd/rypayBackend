
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('transaction_money')
export class TransactionMoney {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column()
    name: string;

    @Column('decimal', {
        transformer: {
          to: (value: number | string) => Number(value),   // always store as number
          from: (value: string) => parseFloat(value),      // convert DB string → number
        }
      })
      amount: number;

    @Column({ default: 'PENDING' })
    status: string;

    @CreateDateColumn({ type: 'timestamp' })
    transaction_date: Date;

    @Column()
    user_id: string;

    @Column()
    transaction_id: string;

    @Column()
    reference: string;   // ✅ added

    @Column()
    message: string;

    @Column({ default: 'CREDIT' })
    type: string;

    @Column()
    bank: string;

    @Column()
    ifsc: string;
}
