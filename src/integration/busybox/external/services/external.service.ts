import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusyBoxWebhookResponse, Webhook_Type } from 'src/core/entities/busybox_webhook_logs.entity';
import { Wallet } from 'src/core/entities/wallet.entity';
import { VirtualAccount } from 'src/core/entities/virtual-account.entity'
import { Repository } from 'typeorm';
import { TransactionNotifyPayload } from '../interfaces/transaction-notify.interface';
import { TransactionMoney } from 'src/core/entities/transaction-money.entity';
import { WalletService } from 'src/wallet/services/wallet.service';
import { KycWebhookPayload } from '../interfaces/kyc-webhook-payload.interface';
import { UsersService } from 'src/users/services/users.service';
import { TransactionDto } from '../interfaces/upi-transaction-payload.dto';

@Injectable()
export class ExternalService {
    private readonly logger: Logger
    constructor(
        @InjectRepository(BusyBoxWebhookResponse) private busyBoxWebHookRepo: Repository<BusyBoxWebhookResponse>,
        @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
        @InjectRepository(VirtualAccount) private virtualAccountRepo: Repository<VirtualAccount>,
        @InjectRepository(TransactionMoney) private transactionMoneyRepo: Repository<TransactionMoney>,
        private walletService: WalletService,
        private userService: UsersService,
    ) {
        this.logger = new Logger(ExternalService.name)
    }

    // debit amount from wallet
    async handleCardtransactions(payload: TransactionNotifyPayload) {
        try {
            const transactionModel = {
                type: Webhook_Type.TRANSACTION,
                additionalData: payload
            }
            await this.busyBoxWebHookRepo.save(transactionModel);
            await this.walletService.debitAmountOnCardTransaction(payload);
            return {
                message: 'Success'
            }
        } catch (err) {
            // log message
            throw err
        }
    }

    async handleKycEvents(payload: KycWebhookPayload) {
        try {
            const transactionModel = {
                type: Webhook_Type.KYC_EVENT,
                additionalData: payload
            }
            await this.busyBoxWebHookRepo.save(transactionModel);
            await this.userService.handleKycEvent(payload.cardholderId, payload.kycStatus);
            return {
                message: 'Success'
            }
        } catch (err) {
            // log message
            throw err;
        }
    }

    async handleUpiEvents(payload: unknown) {
        try {
            const transactionModel = {
                type: Webhook_Type.UPI,
                additionalData: payload
            }
            await this.busyBoxWebHookRepo.save(transactionModel);
            this.logger.log(payload);
            return {
                message: 'Success'
            }
        } catch (err) {
            // log message
            throw err;
        }
    }

    async handlePayoutEvents(payload: unknown) {
        try {
            const transactionModel = {
                type: Webhook_Type.Payout,
                additionalData: payload
            }
            await this.busyBoxWebHookRepo.save(transactionModel);
            this.logger.log(payload);
            return {
                message: 'Success'
            }
        } catch (err) {
            // log message
            throw err;
        }
    }
    // async handleBusyBoxPayoutEvents(payload: any) {
    //     console.log("payload in service===================================>", payload)
    //     try {
    //         const transactionModel = {
    //             type: Webhook_Type.Payout,
    //             additionalData: payload
    //         }
    //         console.log("payload====???", payload)
    //         // await this.busyBoxWebHookRepo.save(transactionModel);
    //         this.logger.log(payload);
    //         return {
    //             message: 'Success'
    //         }
    //     } catch (err) {
    //         // log message
    //         console.log("<====================Error===========================================>", err)
    //         throw err;
    //     }
    // }
    async handleBusyBoxPayoutEvents(payload: any) {
        try {
            const transactionModel = {
                type: Webhook_Type.Payout,
                additionalData: payload,
            };

            this.logger.log(`BusyBox webhook received: ${JSON.stringify(payload)}`);
            if (transactionModel.additionalData?.status === 'SUCCESS' && transactionModel.additionalData?.amount) {
                const user = await this.virtualAccountRepo.findOneBy({ accountnumber: transactionModel.additionalData.va_number });
                if (user) {
                    let walletTo = await this.walletRepository.findOneBy({ user: { id: user.userid } });
                    walletTo.balance = Number(walletTo.balance || 0) + Number(transactionModel.additionalData?.amount);
                    let savedWallet = await this.walletRepository.save(walletTo);

                }
                const newAccount = this.transactionMoneyRepo.create({
                    name: transactionModel?.additionalData?.remitter_name,
                    type: 'CREDIT',
                    amount: Number(transactionModel.additionalData?.amount),
                    message: null,
                    reference: transactionModel.additionalData?.rrn,
                    transaction_date: new Date(),
                    status: "SUCCESS",
                    ifsc: null,
                    user_id: user?.userid,
                    convenience_fee: 0,
                    transaction_id: transactionModel?.additionalData?.txn_id,
                    bank: null,
                });
                const saved = await this.transactionMoneyRepo.save(newAccount);


            }


            return { message: 'Success' };
        } catch (err) {
            console.log('❌ Error while handling BusyBox webhook:', err);
            throw err;
        }
    }

    async handleDebitEvents(payload: TransactionDto) {
        try {
            const transactionModel = {
                type: Webhook_Type.DEBIT,
                additionalData: payload
            }
            await this.busyBoxWebHookRepo.save(transactionModel);
            this.logger.debug('DEBIT', payload);
            return {
                message: 'Success'
            }
        } catch (err) {
            // log message
            throw err;
        }
    }
}
