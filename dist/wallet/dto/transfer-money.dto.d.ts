import { TransactionStatus } from "src/core/entities/transactions.entity";
import { User } from "src/core/entities/user.entity";
import { Wallet } from "src/core/entities/wallet.entity";
import { TransactionType } from "src/transactions/enum/transaction-type.enum";
export declare class AddMoneyToWalletDto {
    user: User;
    walletId: string;
    wallet: Wallet;
    amount: number;
    message: string;
    type: TransactionType;
    transactionHash: string;
    description: string;
    reference: string;
    walletBalanceBefore: number;
    walletBalanceAfter: number;
    transactionDate: Date;
    sender: string;
    receiver: string;
    receiverAccountNo: string;
}
export declare class TransferMoneyDto {
    user: User;
    wallet: Wallet;
    walletId: string;
    amount: number;
    transactionType: string;
    transactionHash: string;
    message: string | null;
    description: string;
    reference: string;
    walletBalanceBefore: number;
    walletBalanceAfter: number;
    transactionDate: Date;
    sender: number;
    receiver: number;
    receiverAccountNo: string;
}
export declare class DeductWalletBalanceRechargeDto {
    amount: number;
    reference: string;
    receiverId: string;
    description: string;
    status: TransactionStatus;
    charges?: number;
    serviceUsed: string;
    convenienceFee?: number;
}
export declare class AddMoneyThroughPGDTO {
    amount: number;
    reference: string;
    receiverId: string;
    description: string;
    status: TransactionStatus;
    serviceUsed: string;
}
export declare class UpdateWalletAfterRechargeDto extends DeductWalletBalanceRechargeDto {
    user: User;
    wallet: Wallet;
    walletId: string;
    amount: number;
    transactionType: string;
    transactionHash: string;
    description: string;
    reference: string;
    walletBalanceBefore: number;
    walletBalanceAfter: number;
    transactionDate: Date;
}
