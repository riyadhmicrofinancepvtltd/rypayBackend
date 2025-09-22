"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ExternalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const busybox_webhook_logs_entity_1 = require("../../../../core/entities/busybox_webhook_logs.entity");
const wallet_entity_1 = require("../../../../core/entities/wallet.entity");
const virtual_account_entity_1 = require("../../../../core/entities/virtual-account.entity");
const typeorm_2 = require("typeorm");
const transaction_money_entity_1 = require("../../../../core/entities/transaction-money.entity");
const wallet_service_1 = require("../../../../wallet/services/wallet.service");
const users_service_1 = require("../../../../users/services/users.service");
let ExternalService = ExternalService_1 = class ExternalService {
    constructor(busyBoxWebHookRepo, walletRepository, virtualAccountRepo, transactionMoneyRepo, walletService, userService) {
        this.busyBoxWebHookRepo = busyBoxWebHookRepo;
        this.walletRepository = walletRepository;
        this.virtualAccountRepo = virtualAccountRepo;
        this.transactionMoneyRepo = transactionMoneyRepo;
        this.walletService = walletService;
        this.userService = userService;
        this.logger = new common_1.Logger(ExternalService_1.name);
    }
    async handleCardtransactions(payload) {
        try {
            const transactionModel = {
                type: busybox_webhook_logs_entity_1.Webhook_Type.TRANSACTION,
                additionalData: payload
            };
            await this.busyBoxWebHookRepo.save(transactionModel);
            await this.walletService.debitAmountOnCardTransaction(payload);
            return {
                message: 'Success'
            };
        }
        catch (err) {
            throw err;
        }
    }
    async handleKycEvents(payload) {
        try {
            const transactionModel = {
                type: busybox_webhook_logs_entity_1.Webhook_Type.KYC_EVENT,
                additionalData: payload
            };
            await this.busyBoxWebHookRepo.save(transactionModel);
            await this.userService.handleKycEvent(payload.cardholderId, payload.kycStatus);
            return {
                message: 'Success'
            };
        }
        catch (err) {
            throw err;
        }
    }
    async handleUpiEvents(payload) {
        try {
            const transactionModel = {
                type: busybox_webhook_logs_entity_1.Webhook_Type.UPI,
                additionalData: payload
            };
            await this.busyBoxWebHookRepo.save(transactionModel);
            this.logger.log(payload);
            return {
                message: 'Success'
            };
        }
        catch (err) {
            throw err;
        }
    }
    async handlePayoutEvents(payload) {
        try {
            const transactionModel = {
                type: busybox_webhook_logs_entity_1.Webhook_Type.Payout,
                additionalData: payload
            };
            await this.busyBoxWebHookRepo.save(transactionModel);
            this.logger.log(payload);
            return {
                message: 'Success'
            };
        }
        catch (err) {
            throw err;
        }
    }
    async handleBusyBoxPayoutEvents(payload) {
        try {
            const transactionModel = {
                type: busybox_webhook_logs_entity_1.Webhook_Type.Payout,
                additionalData: payload,
            };
            console.log('✅ Processed Transaction Model:', transactionModel);
            this.logger.log(`BusyBox webhook received: ${JSON.stringify(payload)}`);
            if (transactionModel.additionalData?.status === 'SUCCESS' && transactionModel.additionalData?.amount) {
                const user = await this.virtualAccountRepo.findOneBy({ accountnumber: transactionModel.additionalData.va_number });
                console.log('User found for VA number:', user);
                if (user) {
                    let walletTo = await this.walletRepository.findOneBy({ user: { id: user.userid } });
                    console.log('Wallet before update:', walletTo);
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
                console.log('New TransactionMoney entity:', newAccount);
                const saved = await this.transactionMoneyRepo.save(newAccount);
            }
            return { message: 'Success' };
        }
        catch (err) {
            console.log('❌ Error while handling BusyBox webhook:', err);
            throw err;
        }
    }
    async handleDebitEvents(payload) {
        try {
            const transactionModel = {
                type: busybox_webhook_logs_entity_1.Webhook_Type.DEBIT,
                additionalData: payload
            };
            await this.busyBoxWebHookRepo.save(transactionModel);
            this.logger.debug('DEBIT', payload);
            return {
                message: 'Success'
            };
        }
        catch (err) {
            throw err;
        }
    }
};
exports.ExternalService = ExternalService;
exports.ExternalService = ExternalService = ExternalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(busybox_webhook_logs_entity_1.BusyBoxWebhookResponse)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(2, (0, typeorm_1.InjectRepository)(virtual_account_entity_1.VirtualAccount)),
    __param(3, (0, typeorm_1.InjectRepository)(transaction_money_entity_1.TransactionMoney)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        wallet_service_1.WalletService,
        users_service_1.UsersService])
], ExternalService);
//# sourceMappingURL=external.service.js.map