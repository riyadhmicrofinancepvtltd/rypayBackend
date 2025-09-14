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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fs = require("fs");
const Handlebars = require("handlebars");
const path = require("path");
const qrcode = require("qrcode");
const service_types_constant_1 = require("../../core/constants/service-types.constant");
const notification_entity_1 = require("../../core/entities/notification.entity");
const order_entity_1 = require("../../core/entities/order.entity");
const transactions_entity_1 = require("../../core/entities/transactions.entity");
const user_entity_1 = require("../../core/entities/user.entity");
const wallet_entity_1 = require("../../core/entities/wallet.entity");
const hash_util_1 = require("../../core/utils/hash.util");
const notification_bridge_1 = require("../../notifications/services/notification-bridge");
const transaction_type_enum_1 = require("../../transactions/enum/transaction-type.enum");
const transactions_service_1 = require("../../transactions/services/transactions.service");
const typeorm_2 = require("typeorm");
const wallet_qr_constant_1 = require("../constant/wallet-qr.constant");
const coins_service_1 = require("../../coins/coins.service");
let WalletService = class WalletService {
    constructor(walletRepository, _connection, transactionsService, userRepository, orderRepository, transactionRepo, notificationBridge, coinsService) {
        this.walletRepository = walletRepository;
        this._connection = _connection;
        this.transactionsService = transactionsService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.transactionRepo = transactionRepo;
        this.notificationBridge = notificationBridge;
        this.coinsService = coinsService;
    }
    async handleTransaction(action) {
        const queryRunner = this._connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const result = await action(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findUserById(userId) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return user;
    }
    async findWalletByUserId(userId) {
        const wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
        if (!wallet) {
            throw new common_1.HttpException('Wallet not found', common_1.HttpStatus.NOT_FOUND);
        }
        return wallet;
    }
    async findWalletByUserIdFrom(userId) {
        const wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
        if (!wallet) {
            throw new common_1.HttpException('Wallet not found', common_1.HttpStatus.NOT_FOUND);
        }
        return wallet;
    }
    async findWalletByUserIdTo(userId) {
        const wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
        if (!wallet) {
            throw new common_1.HttpException('Wallet not found', common_1.HttpStatus.NOT_FOUND);
        }
        return wallet;
    }
    async updateWalletBalance(wallet, amount, queryRunner, isCredit) {
        const balance = Number.parseFloat(wallet.balance?.toString());
        wallet.balance = isCredit ? balance + amount : balance - amount;
        wallet.updatedAt = new Date();
        return queryRunner.manager.save(wallet);
    }
    async createWallet(createWalletDto, queryRunner) {
        const wallet = this.walletRepository.create(createWalletDto);
        return queryRunner.manager.save(wallet);
    }
    async getOne(query) {
        return this.walletRepository.findOneBy(query);
    }
    async getWallet(query) {
        const wallet = await this.walletRepository.findOneBy(query);
        console.log("wallet============================>", wallet);
        const { user, createdAt, updatedAt, ...walletData } = wallet;
        return {
            ...walletData,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            updatedAt: updatedAt
        };
    }
    async getWalletQRCode(query) {
        const wallet = await this.walletRepository.findOneBy(query);
        if (!wallet) {
            throw new common_1.BadRequestException('Account not found');
        }
        const name = `${wallet.user.firstName} ${wallet.user.lastName}`;
        const data = wallet_qr_constant_1.WalletQRFormat
            .replace('<walletId>', wallet.walletAccountNo)
            .replace('<WalletUserName>', encodeURIComponent(name))
            .replace('<walletUserPhone>', wallet.user.phoneNumber);
        const qrCode = await qrcode.toDataURL(data);
        const templatePath = path.resolve(__dirname, '../templates', 'wallet.hbs');
        const template = fs.readFileSync(templatePath, 'utf-8');
        const logoPath = path.resolve(__dirname, '../templates', 'new-logo.png');
        const logo = fs.readFileSync(logoPath, 'base64');
        const dataURL = `data:png;base64,${logo}`;
        const Initials = `${wallet.user.firstName.at(0).toUpperCase()}${wallet.user.lastName.at(0).toUpperCase()}`;
        const context = {
            qrCode,
            userName: name,
            userInitials: Initials,
            logo: dataURL
        };
        return Handlebars.compile(template)(context);
    }
    async generateWalletAccountNo() {
        const walletAccountNo = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const existingWallet = await this.getOne({ walletAccountNo });
        return existingWallet ? this.generateWalletAccountNo() : walletAccountNo;
    }
    async UpdateMoneyToWallet(addMoneyWalletDto, userId) {
        return this.handleTransaction(async (queryRunner) => {
            const user = await this.findUserById(userId);
            const wallet = await this.findWalletByUserId(userId);
            const description = addMoneyWalletDto.message ?? (addMoneyWalletDto.type === transaction_type_enum_1.TransactionType.CREDIT ?
                `INR${addMoneyWalletDto.amount} was credited to your account` :
                `INR${addMoneyWalletDto.amount} was debited from your account`);
            const type = addMoneyWalletDto.type ?? transaction_type_enum_1.TransactionType.CREDIT;
            const walletBalanceAfter = type === transaction_type_enum_1.TransactionType.CREDIT ? wallet.balance + addMoneyWalletDto.amount : wallet.balance - addMoneyWalletDto.amount;
            const transaction = {
                ...addMoneyWalletDto,
                user,
                type: type,
                amount: Number(addMoneyWalletDto.amount),
                description: description,
                transactionDate: new Date(),
                walletBalanceBefore: wallet.balance,
                walletBalanceAfter: walletBalanceAfter,
                wallet,
                serviceUsed: service_types_constant_1.ServiceTypes.Wallet,
                sender: user.id,
                status: transactions_entity_1.TransactionStatus.SUCCESS,
                receiver: addMoneyWalletDto.receiver || null,
            };
            await this.updateWalletBalance(wallet, addMoneyWalletDto.amount, queryRunner, type === transaction_type_enum_1.TransactionType.CREDIT);
            await this.transactionsService.saveTransaction(transaction, queryRunner);
            const notificationType = addMoneyWalletDto.type === transaction_type_enum_1.TransactionType.CREDIT ?
                notification_entity_1.NotificationType.TRANSACTION_CREDIT :
                notification_entity_1.NotificationType.TRANSACTION_DEBIT;
            await this.notificationBridge.add('transaction', {
                transaction,
                type: notificationType
            });
            return wallet;
        });
    }
    async debitMyAccount(fundMyAccountDto, req) {
        const userId = req.user.sub;
        return this.handleTransaction(async (queryRunner) => {
            const user = await this.findUserById(userId);
            const wallet = await this.findWalletByUserId(userId);
            if (fundMyAccountDto.amount < 0) {
                throw new common_1.BadRequestException('Amount cannot be negative');
            }
            const transaction = {
                ...fundMyAccountDto,
                user,
                type: transaction_type_enum_1.TransactionType.DEBIT,
                amount: Number(fundMyAccountDto.amount),
                description: `INR${fundMyAccountDto.amount} was debited from your account`,
                transactionDate: new Date(),
                walletBalanceBefore: wallet.balance,
                walletBalanceAfter: wallet.balance - fundMyAccountDto.amount,
                wallet,
                status: transactions_entity_1.TransactionStatus.SUCCESS,
                sender: user.id,
                serviceUsed: service_types_constant_1.ServiceTypes.Wallet,
            };
            await this.updateWalletBalance(wallet, fundMyAccountDto.amount, queryRunner, false);
            await this.transactionsService.saveTransaction(transaction, queryRunner);
            await this.notificationBridge.add('transaction', {
                transaction,
                type: notification_entity_1.NotificationType.TRANSACTION_DEBIT
            });
            return wallet;
        });
    }
    async debitAmountOnCardTransaction(cardTransaction) {
        return this.handleTransaction(async (queryRunner) => {
            const user = await this.userRepository.findOne({ where: { phoneNumber: cardTransaction.cardHolderMobile } });
            const wallet = await this.findWalletByUserId(user.id);
            const amount = Number(cardTransaction.txnAmount);
            const transaction = {
                user,
                reference: (0, hash_util_1.generateRef)(12),
                transactionHash: (0, hash_util_1.generateHash)(),
                type: transaction_type_enum_1.TransactionType.DEBIT,
                amount: Number(cardTransaction.txnAmount),
                description: `${cardTransaction.txnAmount} / ${cardTransaction.txnCategory} `,
                transactionDate: new Date(),
                receiver: cardTransaction.cardId,
                walletBalanceBefore: wallet.balance,
                walletBalanceAfter: wallet.balance - amount,
                wallet,
                status: transactions_entity_1.TransactionStatus.SUCCESS,
                sender: user.id,
                serviceUsed: cardTransaction.txnCategory,
            };
            await this.updateWalletBalance(wallet, amount, queryRunner, false);
            await this.transactionsService.saveTransaction(transaction, queryRunner);
            return wallet;
        });
    }
    async processFundTransfer(transferAccountDto, req) {
        const userId = req.user.sub;
        return this.handleTransaction(async (queryRunner) => {
            const user = await this.findUserById(userId);
            const receiver = await this.userRepository.findOneBy({
                phoneNumber: transferAccountDto.receiverAccountNo,
            });
            if (!receiver) {
                throw new common_1.BadRequestException('Receiver not found');
            }
            if (receiver.id === userId) {
                throw new common_1.BadRequestException('Self transfer is not available');
            }
            const senderWallet = await this.findWalletByUserId(userId);
            const receiverWallet = await this.findWalletByUserId(receiver.id);
            if (transferAccountDto.amount < 0) {
                throw new common_1.BadRequestException('Amount cannot be negative');
            }
            if (transferAccountDto.amount > senderWallet.balance) {
                throw new common_1.BadRequestException('Insufficient funds');
            }
            const senderMessage = transferAccountDto.description ? transferAccountDto.description : `INR${transferAccountDto.amount} was debited from your wallet`;
            const receiverMessage = transferAccountDto.description ? transferAccountDto.description : `INR${transferAccountDto.amount}/${user.firstName} ${user.lastName}`;
            const [_, transaction] = await Promise.all([
                this.updateWalletBalance(senderWallet, transferAccountDto.amount, queryRunner, false),
                this.transactionsService.saveTransaction({
                    ...transferAccountDto,
                    user,
                    type: transaction_type_enum_1.TransactionType.DEBIT,
                    description: senderMessage,
                    transactionDate: new Date(),
                    walletBalanceBefore: senderWallet.balance,
                    walletBalanceAfter: senderWallet.balance - transferAccountDto.amount,
                    sender: user.id,
                    receiver: receiver.id,
                    status: transactions_entity_1.TransactionStatus.SUCCESS,
                    serviceUsed: service_types_constant_1.ServiceTypes.Wallet,
                }, queryRunner),
                this.updateWalletBalance(receiverWallet, transferAccountDto.amount, queryRunner, true),
                this.transactionsService.saveTransaction({
                    ...transferAccountDto,
                    user: receiver,
                    type: transaction_type_enum_1.TransactionType.CREDIT,
                    description: receiverMessage,
                    transactionDate: new Date(),
                    walletBalanceBefore: receiverWallet.balance,
                    walletBalanceAfter: receiverWallet.balance + transferAccountDto.amount,
                    sender: user.id,
                    receiver: receiver.id,
                    status: transactions_entity_1.TransactionStatus.SUCCESS,
                    serviceUsed: service_types_constant_1.ServiceTypes.Wallet,
                }, queryRunner),
            ]);
            await this.coinsService.addCoins(user.id, transferAccountDto.amount, transaction.id?.toString());
            return senderWallet;
        });
    }
    async processRechargePayment(deductBalanceData, userId) {
        return this.handleTransaction(async (queryRunner) => {
            const user = await this.findUserById(userId);
            const wallet = await this.findWalletByUserId(userId);
            if (deductBalanceData.amount < 0) {
                throw new common_1.BadRequestException('Amount cannot be negative');
            }
            let walletBalance = Number.parseFloat(wallet.balance?.toString());
            if (deductBalanceData.amount > walletBalance) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const rechargeDto = {
                ...deductBalanceData,
                transactionHash: (0, hash_util_1.generateHash)(),
                user: user,
                type: transaction_type_enum_1.TransactionType.DEBIT,
                transactionDate: new Date(),
                walletBalanceBefore: walletBalance,
                walletBalanceAfter: walletBalance - deductBalanceData.amount,
                wallet,
                sender: user.id,
                receiver: deductBalanceData.receiverId,
                serviceUsed: deductBalanceData.serviceUsed,
            };
            walletBalance -= deductBalanceData.amount;
            let walletAmountToDeduct = deductBalanceData.amount;
            if (deductBalanceData.charges) {
                const deductCharges = {
                    ...deductBalanceData,
                    amount: deductBalanceData.charges,
                    description: `${deductBalanceData.reference} payment charges`,
                    transactionHash: (0, hash_util_1.generateHash)(),
                    user: user,
                    type: transaction_type_enum_1.TransactionType.DEBIT,
                    transactionDate: new Date(),
                    walletBalanceBefore: walletBalance,
                    walletBalanceAfter: walletBalance - deductBalanceData.charges,
                    wallet,
                    sender: user.id,
                    receiver: deductBalanceData.receiverId,
                    serviceUsed: deductBalanceData.serviceUsed,
                };
                await this.transactionsService.saveTransaction(deductCharges, queryRunner);
                walletAmountToDeduct += deductBalanceData.charges;
            }
            await this.updateWalletBalance(wallet, walletAmountToDeduct, queryRunner, false);
            const transaction = await this.transactionsService.saveTransaction(rechargeDto, queryRunner);
            await this.coinsService.addCoins(user.id, deductBalanceData.amount, transaction.id?.toString());
            await this.notificationBridge.add('transaction', {
                transaction,
                type: notification_entity_1.NotificationType.TRANSACTION_DEBIT
            });
            return wallet;
        });
    }
    async processPaymentGatewaySuccess(addMoneyDto, userId) {
        return this.handleTransaction(async (queryRunner) => {
            const user = await this.findUserById(userId);
            const wallet = await this.findWalletByUserId(userId);
            if (addMoneyDto.amount < 0) {
                throw new common_1.BadRequestException('Amount cannot be negative');
            }
            let walletBalance = Number.parseFloat(wallet.balance?.toString());
            const rechargeDto = {
                ...addMoneyDto,
                transactionHash: (0, hash_util_1.generateHash)(),
                user: user,
                type: transaction_type_enum_1.TransactionType.CREDIT,
                transactionDate: new Date(),
                walletBalanceBefore: walletBalance,
                walletBalanceAfter: walletBalance + addMoneyDto.amount,
                wallet,
                sender: user.id,
                receiver: addMoneyDto.receiverId,
                serviceUsed: addMoneyDto.serviceUsed,
            };
            walletBalance -= addMoneyDto.amount;
            await this.updateWalletBalance(wallet, addMoneyDto.amount, queryRunner, true);
            const transaction = await this.transactionsService.saveTransaction(rechargeDto, queryRunner);
            await this.notificationBridge.add('transaction', {
                transaction,
                type: notification_entity_1.NotificationType.TRANSACTION_CREDIT
            });
            return wallet;
        });
    }
    async processRechargeRefundPayment(orderId) {
        return this.handleTransaction(async (queryRunner) => {
            const order = await this.orderRepository.findOne({ where: { order_id: orderId }, relations: { user: true } });
            order.amount = Number(order.amount);
            if (order) {
                const user = order.user;
                const wallet = await this.findWalletByUserId(user.id);
                if (!wallet) {
                    throw new common_1.BadRequestException('wallet not found for user');
                }
                if (order.amount < 0) {
                    throw new common_1.BadRequestException('Amount cannot be negative');
                }
                if (order.status !== order_entity_1.OrderStatus.PENDING) {
                    throw new common_1.BadRequestException('Order is not in pending state');
                }
                order.status = order_entity_1.OrderStatus.FAILED;
                const transaction = await this.transactionRepo.findOne({ where: { reference: orderId } });
                transaction.status = transactions_entity_1.TransactionStatus.FAILED;
                await queryRunner.manager.save(transaction);
                await queryRunner.manager.save(order);
                await this.updateWalletBalance(wallet, order.amount, queryRunner, true);
                await this.notificationBridge.add('recharge', {
                    order,
                    transaction,
                    type: notification_entity_1.NotificationType.RECHARGE_FAILED
                });
                return wallet;
            }
            else {
                throw new common_1.NotFoundException('order not found');
            }
        });
    }
    async processRechargeSuccess(orderId, transactionId, gatewayId) {
        return this.handleTransaction(async (queryRunner) => {
            const order = await this.orderRepository.findOne({ where: { order_id: orderId } });
            order.status = order_entity_1.OrderStatus.SUCCESS;
            order.gateway_response = gatewayId;
            const transaction = await this.transactionRepo.findOne({ where: { reference: orderId } });
            transaction.status = transactions_entity_1.TransactionStatus.SUCCESS;
            order.transaction_id = transactionId;
            await queryRunner.manager.save(transaction);
            await queryRunner.manager.save(order);
            await this.notificationBridge.add('recharge', {
                order,
                transaction,
                type: notification_entity_1.NotificationType.RECHARGE_SUCCESS
            });
            return true;
        });
    }
    async processLoanPayment(deductBalanceData, userId) {
        return this.handleTransaction(async (queryRunner) => {
            const user = await this.findUserById(userId);
            const wallet = await this.findWalletByUserId(userId);
            if (deductBalanceData.amount < 0) {
                throw new common_1.BadRequestException('Amount cannot be negative');
            }
            if (deductBalanceData.amount > wallet.balance) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const rechargeDto = {
                ...deductBalanceData,
                transactionHash: (0, hash_util_1.generateHash)(),
                user: user,
                type: transaction_type_enum_1.TransactionType.DEBIT,
                transactionDate: new Date(),
                walletBalanceBefore: wallet.balance,
                walletBalanceAfter: wallet.balance - deductBalanceData.amount,
                wallet,
                sender: user.id,
                receiver: deductBalanceData.receiverId,
                serviceUsed: deductBalanceData.serviceUsed,
            };
            await this.updateWalletBalance(wallet, deductBalanceData.amount, queryRunner, false);
            const transaction = await this.transactionsService.saveTransaction(rechargeDto, queryRunner);
            await this.coinsService.addCoins(user.id, deductBalanceData.amount, transaction.id?.toString());
            return wallet;
        });
    }
    async handleReferrelBonus(referrerUserId, refreeId) {
        return this.handleTransaction(async (queryRunner) => {
            try {
                const [referrer, refree, referrerWallet, refreeWallet, bonusAmount] = await Promise.all([
                    this.findUserById(referrerUserId),
                    this.findUserById(refreeId),
                    this.findWalletByUserId(referrerUserId),
                    this.findWalletByUserId(refreeId),
                    this.getReferrelBonus()
                ]);
                if (!bonusAmount)
                    return;
                const [referrerOrder, refreeOrder] = await Promise.all([
                    this.createAndSaveReferralOrder(bonusAmount, referrer),
                    this.createAndSaveReferralOrder(bonusAmount, refree)
                ]);
                await Promise.all([
                    this.updateWalletBalance(referrerWallet, bonusAmount, queryRunner, true),
                    this.updateWalletBalance(refreeWallet, bonusAmount, queryRunner, true)
                ]);
                const [referrerTransaction, refreeTransaction] = this.createReferralTransactions(referrer, referrerOrder, referrerWallet, bonusAmount, refree, refreeOrder, refreeWallet);
                const [t1, t2] = await Promise.all([
                    this.transactionsService.saveTransaction(referrerTransaction, queryRunner),
                    this.transactionsService.saveTransaction(refreeTransaction, queryRunner)
                ]);
                await Promise.all([
                    this.sendReferralBonusNotification(t1, refree, true),
                    this.sendReferralBonusNotification(t2, referrer, false)
                ]);
            }
            catch (err) {
                console.error('Failed to add referral bonus', err);
            }
        });
    }
    async handleCoinRedeem(data) {
        return this.handleTransaction(async (queryRunner) => {
            if (data) {
                data.redemptionValue = Number.parseFloat(data.redemptionValue?.toString());
            }
            const userWallet = await this.walletRepository.findOneBy({ user: { id: data.user.id } });
            const order = await this.createAndSaveCashbackOrder(data.redemptionValue, data.user);
            const transactionDto = {
                transactionHash: (0, hash_util_1.generateHash)(),
                user: data.user,
                reference: order.order_id,
                type: transaction_type_enum_1.TransactionType.CREDIT,
                status: transactions_entity_1.TransactionStatus.SUCCESS,
                description: `Rs.${data.redemptionValue} Redeemed`,
                amount: data.redemptionValue,
                transactionDate: new Date(),
                walletBalanceBefore: userWallet.balance,
                walletBalanceAfter: userWallet.balance + data.redemptionValue,
                userWallet,
                sender: data.user.id,
                receiver: data.user.id,
                serviceUsed: 'WALLET',
            };
            await this.updateWalletBalance(userWallet, data.redemptionValue, queryRunner, true);
            await this.transactionsService.saveTransaction(transactionDto, queryRunner);
            await this.notificationBridge.add('cashback', {
                data,
                type: notification_entity_1.NotificationType.CASHBACK_REDEEMED
            });
            return userWallet;
        });
    }
    async createAndSaveReferralOrder(bonusAmount, user) {
        const order = this.orderRepository.create(this.getNewReferelOrder(bonusAmount, user));
        await this.orderRepository.save(order);
        return order;
    }
    async createAndSaveCashbackOrder(amount, user) {
        const order = this.orderRepository.create(this.getNewCashbackOrder(amount, user));
        await this.orderRepository.save(order);
        return order;
    }
    createReferralTransactions(referrer, referrerOrder, referrerWallet, bonusAmount, refree, refreeOrder, refreeWallet) {
        const referrerTransaction = this.getTransactionModelForReferrel(referrer, referrerOrder.order_id, transaction_type_enum_1.TransactionType.CREDIT, referrerWallet, bonusAmount, refree, 'Referral');
        const refreeTransaction = this.getTransactionModelForReferrel(refree, refreeOrder.order_id, transaction_type_enum_1.TransactionType.CREDIT, refreeWallet, bonusAmount, referrer, 'Referral');
        return [referrerTransaction, refreeTransaction];
    }
    async sendReferralBonusNotification(transaction, counterPartyUser, isReferrer) {
        await this.notificationBridge.add('referrel', {
            transaction,
            isReferrer,
            counterPartyUser,
            type: notification_entity_1.NotificationType.REFERREL_BONUS
        });
    }
    getNewReferelOrder(amount, user) {
        return {
            order_id: (0, hash_util_1.generateRef)(12),
            order_type: order_entity_1.OrderType.PAYMENT,
            gateway_response: '',
            amount: amount,
            status: order_entity_1.OrderStatus.SUCCESS,
            transaction_id: '',
            user: user,
            description: 'Referel earning',
            payment_method: 'WALLET',
            paymentMode: 'Referel',
            respectiveUserName: '',
            ifscNumber: '',
            accountId: ''
        };
    }
    getNewCashbackOrder(amount, user) {
        return {
            order_id: (0, hash_util_1.generateRef)(12),
            order_type: order_entity_1.OrderType.PAYMENT,
            gateway_response: '',
            amount: amount,
            status: order_entity_1.OrderStatus.SUCCESS,
            transaction_id: '',
            user: user,
            description: 'cashback earning',
            payment_method: 'WALLET',
            paymentMode: 'Cashback',
            respectiveUserName: '',
            ifscNumber: '',
            accountId: ''
        };
    }
    getReferrelBonus() {
        const bonus = process.env.REFERREL_BONUS;
        return bonus ? Number.parseFloat(bonus) : 0;
    }
    getTransactionModelForReferrel(receiver, referenceId, transactionType, wallet, amount, sender, serviceUsed) {
        const walletAmount = transactionType === transaction_type_enum_1.TransactionType.CREDIT ? wallet.balance + amount : wallet.balance - amount;
        return {
            transactionHash: (0, hash_util_1.generateHash)(),
            reference: referenceId,
            user: receiver,
            description: 'Referrel Bonus',
            status: transactions_entity_1.TransactionStatus.SUCCESS,
            type: transactionType,
            amount: amount,
            transactionDate: new Date(),
            walletBalanceBefore: wallet.balance,
            walletBalanceAfter: walletAmount,
            wallet,
            sender: sender.id,
            receiver: receiver.id,
            serviceUsed: serviceUsed,
        };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(5, (0, typeorm_1.InjectRepository)(transactions_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        transactions_service_1.TransactionsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_bridge_1.NotificationBridge,
        coins_service_1.CoinTransactionService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map