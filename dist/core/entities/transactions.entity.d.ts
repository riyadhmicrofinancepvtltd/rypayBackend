import { User } from './user.entity';
export declare enum TransactionStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    DISPUTED = "DISPUTED"
}
export declare class Transaction {
    id: number;
    user: User;
    walletBalanceBefore: number;
    walletBalanceAfter: number;
    amount: number;
    description: string;
    type: 'CREDIT' | 'DEBIT';
    serviceUsed: string;
    createdAt: Date;
    updatedAt: Date;
    sender: string;
    receiver: string;
    transactionHash: string;
    reference: string;
    transactionDate: Date;
    ifsc: string;
    name: string;
    message: string;
    bank: string;
    transaction_id: string;
    status: TransactionStatus;
}
