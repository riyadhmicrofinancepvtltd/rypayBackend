import { ApiProperty } from "@nestjs/swagger";
import { Length } from "class-validator";
import { IsEnum } from 'class-validator';
import { PaymentMode } from 'src/core/enum/payment-mode.enum';

export class PinRequestDto {
    @ApiProperty()
    @Length(4,4)
    pin: string;
}

export class UpdateForgotPin {
    @ApiProperty()
    @Length(4,4)
    newPin: string;

    @ApiProperty()
    otp: string;
}

export class TransactionPinRequestDto {
    @ApiProperty()
    @Length(6,6)
    transferPin: string;
}

export class UpdateTransactionPinDto {
    @ApiProperty()
    @Length(6,6)
    newTransferPin: string;

    @ApiProperty()
    otp: string;
}

export class deleteUserAccountDto {
    @ApiProperty()
    @Length(4,4)
    lockPin: string;

    @ApiProperty()
    reason: string;
}

export class ToContactRequestDto {
   phoneNumber: string;
}

export class SendMoneyRequestDto {
    @ApiProperty()
    paymentMode: string;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    transactionPIN: string;

    @ApiProperty()    
    number: string;

 }



 