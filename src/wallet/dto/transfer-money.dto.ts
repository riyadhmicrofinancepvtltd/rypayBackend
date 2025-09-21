import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { OrderStatus } from "src/core/entities/order.entity";
import { TransactionStatus } from "src/core/entities/transactions.entity";
import { User } from "src/core/entities/user.entity";
import { Wallet } from "src/core/entities/wallet.entity";
import { TransactionType } from "src/transactions/enum/transaction-type.enum";

export class AddMoneyToWalletDto {
    user: User;

    walletId: string;

    wallet: Wallet;
  
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;

    @IsNotEmpty()
    @ApiProperty()
    message: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsIn([TransactionType.CREDIT, TransactionType.DEBIT])
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
  
  export class TransferMoneyDto {
    user: User;
  
    wallet: Wallet;

    walletId: string;
  
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;
  
    transactionType: string;
  
    transactionHash: string;
  
    @ApiProperty()
    message: string | null
    
    description: string;
  
    reference: string;
  
    walletBalanceBefore: number;
  
    walletBalanceAfter: number;
  
    transactionDate: Date;
  
    sender: number;
  
    receiver: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    receiverAccountNo: string;
  }

  export class DeductWalletBalanceRechargeDto {
    amount: number;
    reference: string;
    receiverId: string;
    description: string;
    status: TransactionStatus;
    charges?: number;
    serviceUsed: string;
    convenienceFee?: number;
  }

  export class AddMoneyThroughPGDTO {
    amount: number;
    reference: string;
    receiverId: string;
    description: string;
    status: TransactionStatus;
    serviceUsed: string;
  }

  export class UpdateWalletAfterRechargeDto extends DeductWalletBalanceRechargeDto {
    user: User;
  
    wallet: Wallet;

    walletId: string;
  
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;
  
    transactionType: string;
  
    transactionHash: string;
  
    description: string;
  
    reference: string;
  
    walletBalanceBefore: number;
  
    walletBalanceAfter: number;
  
    transactionDate: Date;
  }