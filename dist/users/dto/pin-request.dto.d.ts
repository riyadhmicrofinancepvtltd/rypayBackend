export declare class PinRequestDto {
    pin: string;
}
export declare class UpdateForgotPin {
    newPin: string;
    otp: string;
}
export declare class TransactionPinRequestDto {
    transferPin: string;
}
export declare class UpdateTransactionPinDto {
    newTransferPin: string;
    otp: string;
}
export declare class deleteUserAccountDto {
    lockPin: string;
    reason: string;
}
export declare class ToContactRequestDto {
    phoneNumber: string;
}
export declare class SendMoneyRequestDto {
    paymentMode: string;
    amount: number;
    transactionPIN: string;
    number: string;
    upiId: string;
    upiUserName: string;
    message: string;
    accountNumber: string;
    ifsc: string;
    mode: string;
    userName: string;
    convenienceFee: number;
}
export declare class CreateOrderRequestDto {
    amount: number;
    note: string;
    customer_name: string;
    customer_mobile: string;
    customer_email: string;
}
export declare class PaymentStatusRequestDto {
    order_id: string;
}
export declare class ScratchRewardRequestDto {
    reward_id: string;
}
