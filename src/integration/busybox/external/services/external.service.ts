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
import { UPICollectionsTransactionMoney } from 'src/core/entities/upi-collections-transactions.entity';

@Injectable()
export class ExternalService {
    private readonly logger: Logger
    constructor(
        @InjectRepository(BusyBoxWebhookResponse) private busyBoxWebHookRepo: Repository<BusyBoxWebhookResponse>,
        @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
        @InjectRepository(VirtualAccount) private virtualAccountRepo: Repository<VirtualAccount>,
        @InjectRepository(TransactionMoney) private transactionMoneyRepo: Repository<TransactionMoney>,
        @InjectRepository(UPICollectionsTransactionMoney) private upiCollectionsTransactionRepo: Repository<UPICollectionsTransactionMoney>,
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
            if (transactionModel.additionalData?.status === 'SUCCESS' && transactionModel.additionalData?.amount) {
                const user = await this.virtualAccountRepo.findOneBy({ accountnumber: transactionModel.additionalData.va_number });
                if (user) {
                    let walletTo = await this.walletRepository.findOneBy({ user: { id:String( user.userid) } });
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
                    transaction_mode: "VIRTUAL_ACCOUNT",
                    ifsc: null,
                    user_id: String(user?.userid),
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
    async handleUPICollectionsWebhook(payload: any) {
        try {
            this.logger.log(payload);
            const transactionModel = {
                type: Webhook_Type.UPI_COLLECTION,
                additionalData: payload,
            };
            // if (transactionModel.additionalData?.status === 'SUCCESS' && transactionModel.additionalData?.amount) {
            // const user = await this.virtualAccountRepo.findOneBy({ accountnumber: transactionModel.additionalData.va_number });
            // if (user) {
            //     let walletTo = await this.walletRepository.findOneBy({ user: { id: user.userid } });
            //     walletTo.balance = Number(walletTo.balance || 0) + Number(transactionModel.additionalData?.amount);
            //     let savedWallet = await this.walletRepository.save(walletTo);

            // }
            await this.busyBoxWebHookRepo.save(transactionModel);

            const newTxn = this.upiCollectionsTransactionRepo.create({
                // name: payload.name || null,
                // amount: Number(payload.amount),
                // status: payload.status || 'PENDING',
                // transaction_date: new Date(),
                // user_id: payload.user_id || null,
                // transaction_id: payload.transaction_id,
                // reference: payload.reference || null,
                // message: payload.message || null,
                // type: payload.type || 'CREDIT',
                // bank: payload.bank || null,
                // ifsc: payload.ifsc || null,
                // convenience_fee: 0,
                // transaction_mode: payload.transaction_mode || 'UPI',
                // number: payload.number || null,
                // upi: payload.upi || null,
                // bank_mode: payload.bank_mode || null,
                data: payload.data || {},
            });

            const saved = await this.upiCollectionsTransactionRepo.save(newTxn);


            // }
            return { message: 'Success' };


        } catch (err) {
            console.log('❌ Error processing UPI Collection webhook:', err.message);
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

    async handleUPIPayoutCallbacks(payload: any) {
        try {
            const transactionModel = {
                type: Webhook_Type.Payout,
                additionalData: payload,
            };
            if (transactionModel.additionalData?.status === 'SUCCESS' && transactionModel.additionalData?.amount) {
                const user = await this.virtualAccountRepo.findOneBy({ accountnumber: transactionModel.additionalData.va_number });
                if (user) {
                    let walletTo = await this.walletRepository.findOneBy({ user: { id: String(user.userid) } });
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
                    transaction_mode: "VIRTUAL_ACCOUNT",
                    ifsc: null,
                    user_id:String( user?.userid),
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
}
