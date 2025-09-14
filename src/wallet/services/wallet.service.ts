import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as qrcode from 'qrcode';
import { ServiceTypes } from 'src/core/constants/service-types.constant';
import { NotificationType } from 'src/core/entities/notification.entity';
import { Order, OrderStatus, OrderType } from 'src/core/entities/order.entity';
import { Transaction, TransactionStatus } from 'src/core/entities/transactions.entity';
import { User } from 'src/core/entities/user.entity';
import { Wallet } from 'src/core/entities/wallet.entity';
import { generateHash, generateRef } from 'src/core/utils/hash.util';
import { TransactionNotifyPayload } from 'src/integration/busybox/external/interfaces/transaction-notify.interface';
import { NotificationBridge } from 'src/notifications/services/notification-bridge';
import { CreateTransactionDto } from 'src/transactions/dto/create-transaction.dto';
import { TransactionType } from 'src/transactions/enum/transaction-type.enum';
import { TransactionsService } from 'src/transactions/services/transactions.service';
import { DataSource, FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { WalletQRFormat } from '../constant/wallet-qr.constant';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { AddMoneyThroughPGDTO, AddMoneyToWalletDto, DeductWalletBalanceRechargeDto, TransferMoneyDto } from '../dto/transfer-money.dto';
import { CoinTransactionService } from 'src/coins/coins.service';
import { CoinTransaction } from 'src/core/entities/coins.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    private _connection: DataSource,
    private readonly transactionsService: TransactionsService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    private readonly notificationBridge: NotificationBridge,
    private coinsService: CoinTransactionService
  ) {}

  private async handleTransaction<T>(
    action: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await action(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findUserById(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
//createWallet
  private async findWalletByUserId(userId: string) {
    const wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
    if (!wallet) {
      throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }
    return wallet;
  }

  private async findWalletByUserIdFrom(userId: string) {
    const wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
    if (!wallet) {
      throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }
    return wallet;
  }
  private async findWalletByUserIdTo(userId: string) {
    const wallet = await this.walletRepository.findOneBy({ user: { id: userId } });
    if (!wallet) {
      throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }
    return wallet;
  }

  private async updateWalletBalance(
    wallet: Wallet,
    amount: number,
    queryRunner: QueryRunner,
    isCredit: boolean,
  ) {
    const balance = Number.parseFloat(wallet.balance?.toString())
    wallet.balance = isCredit ? balance + amount : balance - amount;
    wallet.updatedAt = new Date();
    return queryRunner.manager.save(wallet);
  }

  async createWallet(createWalletDto: CreateWalletDto, queryRunner: QueryRunner) {
    const wallet = this.walletRepository.create(createWalletDto);
    return queryRunner.manager.save(wallet);
  }

  async getOne(query: FindOptionsWhere<Wallet>): Promise<Wallet> {
    return this.walletRepository.findOneBy(query);
  }

  async getWallet(query: FindOptionsWhere<Wallet>) {
    const wallet = await this.walletRepository.findOneBy(query);
    const { user, createdAt, updatedAt, ...walletData } = wallet;
    return {
      ...walletData,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      updatedAt: updatedAt
    };
  }


  

  async getWalletQRCode(query: FindOptionsWhere<Wallet>) {
    const wallet = await this.walletRepository.findOneBy(query);
    if (!wallet) {
      throw new BadRequestException('Account not found');
    }
    const name = `${wallet.user.firstName} ${wallet.user.lastName}`;
    const data = WalletQRFormat
    .replace('<walletId>', wallet.walletAccountNo)
    .replace('<WalletUserName>', encodeURIComponent(name))
    .replace('<walletUserPhone>', wallet.user.phoneNumber);
    const qrCode = await qrcode.toDataURL(data);
    const templatePath = path.resolve(__dirname, '../templates', 'wallet.hbs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    const logoPath = path.resolve(__dirname, '../templates', 'new-logo.png');
    const logo = fs.readFileSync(logoPath, 'base64');
    const dataURL = `data:png;base64,${logo}`
    const Initials = `${wallet.user.firstName.at(0).toUpperCase()}${wallet.user.lastName.at(0).toUpperCase()}`
    const context = {
      qrCode,
      userName: name,
      userInitials: Initials,
      logo: dataURL
    }
    return Handlebars.compile(template)(context);
  }

  async generateWalletAccountNo(): Promise<string> {
    const walletAccountNo = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const existingWallet = await this.getOne({ walletAccountNo });
    return existingWallet ? this.generateWalletAccountNo() : walletAccountNo;
  }

  async UpdateMoneyToWallet(addMoneyWalletDto: AddMoneyToWalletDto, userId: string): Promise<Wallet> {
    return this.handleTransaction(async (queryRunner) => {
      const user = await this.findUserById(userId);
      const wallet = await this.findWalletByUserId(userId);
      const description = addMoneyWalletDto.message ?? (addMoneyWalletDto.type === TransactionType.CREDIT ?
        `INR${addMoneyWalletDto.amount} was credited to your account` :
        `INR${addMoneyWalletDto.amount} was debited from your account`
      )
      const type = addMoneyWalletDto.type ?? TransactionType.CREDIT;
      const walletBalanceAfter = type === TransactionType.CREDIT ? wallet.balance + addMoneyWalletDto.amount : wallet.balance - addMoneyWalletDto.amount

      const transaction = <CreateTransactionDto>{
        ...addMoneyWalletDto,
        user,
        type: type,
        amount: Number(addMoneyWalletDto.amount),
        description: description,
        transactionDate: new Date(),
        walletBalanceBefore: wallet.balance,
        walletBalanceAfter: walletBalanceAfter,
        wallet,
        serviceUsed: ServiceTypes.Wallet,
        sender: user.id,
        status: TransactionStatus.SUCCESS,
        receiver: addMoneyWalletDto.receiver || null,
      }

      await this.updateWalletBalance(wallet, addMoneyWalletDto.amount, queryRunner, type === TransactionType.CREDIT);
      await this.transactionsService.saveTransaction(transaction, queryRunner);
      const notificationType = addMoneyWalletDto.type === TransactionType.CREDIT ? 
      NotificationType.TRANSACTION_CREDIT :
      NotificationType.TRANSACTION_DEBIT
      await this.notificationBridge.add('transaction', {
        transaction,
        type: notificationType
      });
      return wallet;
    });
  }

  async debitMyAccount(fundMyAccountDto: AddMoneyToWalletDto, req: any): Promise<Wallet> {
    const userId = req.user.sub;
    return this.handleTransaction(async (queryRunner) => {
      const user = await this.findUserById(userId);
      const wallet = await this.findWalletByUserId(userId);

      if (fundMyAccountDto.amount < 0) {
        throw new BadRequestException('Amount cannot be negative');
      }

      const transaction = {
        ...fundMyAccountDto,
        user,
        type: TransactionType.DEBIT,
        amount: Number(fundMyAccountDto.amount),
        description: `INR${fundMyAccountDto.amount} was debited from your account`,
        transactionDate: new Date(),
        walletBalanceBefore: wallet.balance,
        walletBalanceAfter: wallet.balance - fundMyAccountDto.amount,
        wallet,
        status: TransactionStatus.SUCCESS,
        sender: user.id,
        serviceUsed: ServiceTypes.Wallet,
      }

      await this.updateWalletBalance(wallet, fundMyAccountDto.amount, queryRunner, false);
      await this.transactionsService.saveTransaction(transaction, queryRunner);
      await this.notificationBridge.add('transaction', {
        transaction,
        type: NotificationType.TRANSACTION_DEBIT
      });
      return wallet;
    });
  }

  async debitAmountOnCardTransaction(cardTransaction: TransactionNotifyPayload): Promise<Wallet> {
    return this.handleTransaction(async (queryRunner) => {
      const user = await this.userRepository.findOne({where: {phoneNumber: cardTransaction.cardHolderMobile}});
      const wallet = await this.findWalletByUserId(user.id);
      const amount = Number(cardTransaction.txnAmount);
      const transaction = {
        user,
        reference: generateRef(12),
        transactionHash: generateHash(),
        type: TransactionType.DEBIT,
        amount: Number(cardTransaction.txnAmount),
        description: `${cardTransaction.txnAmount} / ${cardTransaction.txnCategory} `,
        transactionDate: new Date(),
        receiver: cardTransaction.cardId,
        walletBalanceBefore: wallet.balance,
        walletBalanceAfter: wallet.balance - amount,
        wallet,
        status: TransactionStatus.SUCCESS,
        sender: user.id,
        serviceUsed: cardTransaction.txnCategory,
      }

      await this.updateWalletBalance(wallet, amount, queryRunner, false);
      await this.transactionsService.saveTransaction(transaction, queryRunner);

      return wallet;
    });
  }

  async processFundTransfer(transferAccountDto: TransferMoneyDto, req: any): Promise<Wallet> {
    const userId = req.user.sub;
    return this.handleTransaction(async (queryRunner) => {
      const user = await this.findUserById(userId);
      const receiver = await this.userRepository.findOneBy({
        phoneNumber: transferAccountDto.receiverAccountNo,
      });
      if (!receiver) {
        throw new BadRequestException('Receiver not found');
      }
      if (receiver.id === userId) {
        throw new BadRequestException('Self transfer is not available');
      }

      const senderWallet = await this.findWalletByUserId(userId);
      const receiverWallet = await this.findWalletByUserId(receiver.id);

      if (transferAccountDto.amount < 0) {
        throw new BadRequestException('Amount cannot be negative');
      }
      if (transferAccountDto.amount > senderWallet.balance) {
        throw new BadRequestException('Insufficient funds');
      }
      const senderMessage = transferAccountDto.description ? transferAccountDto.description : `INR${transferAccountDto.amount} was debited from your wallet`;
      const receiverMessage = transferAccountDto.description ? transferAccountDto.description : `INR${transferAccountDto.amount}/${user.firstName} ${user.lastName}`;

      const [_, transaction] = await Promise.all([
        this.updateWalletBalance(senderWallet, transferAccountDto.amount, queryRunner, false),
        this.transactionsService.saveTransaction(
          {
            ...transferAccountDto,
            user,
            type: TransactionType.DEBIT,
            description: senderMessage,
            transactionDate: new Date(),
            walletBalanceBefore: senderWallet.balance,
            walletBalanceAfter: senderWallet.balance - transferAccountDto.amount,
            sender: user.id,
            receiver: receiver.id,
            status: TransactionStatus.SUCCESS,
            serviceUsed: ServiceTypes.Wallet,
          },
          queryRunner,
        ),
        this.updateWalletBalance(receiverWallet, transferAccountDto.amount, queryRunner, true),
        this.transactionsService.saveTransaction(
          {
            ...transferAccountDto,
            user: receiver,
            type: TransactionType.CREDIT,
            description: receiverMessage,
            transactionDate: new Date(),
            walletBalanceBefore: receiverWallet.balance,
            walletBalanceAfter: receiverWallet.balance + transferAccountDto.amount,
            sender: user.id,
            receiver: receiver.id,
            status: TransactionStatus.SUCCESS,
            serviceUsed: ServiceTypes.Wallet,
          },
          queryRunner,
        ),
      ]);
      await this.coinsService.addCoins(user.id, transferAccountDto.amount, transaction.id?.toString());

      return senderWallet;
    });
  }

  async processRechargePayment(
    deductBalanceData: DeductWalletBalanceRechargeDto,
    userId: string,
  ): Promise<Wallet> {
    return this.handleTransaction(async (queryRunner) => {
      const user = await this.findUserById(userId);
      const wallet = await this.findWalletByUserId(userId);

      if (deductBalanceData.amount < 0) {
        throw new BadRequestException('Amount cannot be negative');
      }
      let walletBalance = Number.parseFloat(wallet.balance?.toString());
      if (deductBalanceData.amount > walletBalance) {
        throw new BadRequestException('Insufficient balance');
      }

      const rechargeDto = {
        ...deductBalanceData,
        transactionHash: generateHash(),
        user: user,
        type: TransactionType.DEBIT,
        transactionDate: new Date(),
        walletBalanceBefore: walletBalance,
        walletBalanceAfter: walletBalance - deductBalanceData.amount,
        wallet,
        sender: user.id,
        receiver: deductBalanceData.receiverId,
        serviceUsed: deductBalanceData.serviceUsed,
      };
      walletBalance -= deductBalanceData.amount;
      //deduct charges, if applicable
      let walletAmountToDeduct = deductBalanceData.amount;
      if (deductBalanceData.charges) {
        const deductCharges = {
          ...deductBalanceData,
          amount: deductBalanceData.charges,
          description: `${deductBalanceData.reference} payment charges`,
          transactionHash: generateHash(),
          user: user,
          type: TransactionType.DEBIT,
          transactionDate: new Date(),
          walletBalanceBefore: walletBalance,
          walletBalanceAfter: walletBalance - deductBalanceData.charges,
          wallet,
          sender: user.id,
          receiver: deductBalanceData.receiverId,
          serviceUsed: deductBalanceData.serviceUsed,
        }
        await this.transactionsService.saveTransaction(deductCharges, queryRunner);
        walletAmountToDeduct += deductBalanceData.charges; 
      }

      await this.updateWalletBalance(wallet, walletAmountToDeduct, queryRunner, false);
      const transaction = await this.transactionsService.saveTransaction(rechargeDto, queryRunner);
      await this.coinsService.addCoins(user.id, deductBalanceData.amount, transaction.id?.toString());
      await this.notificationBridge.add('transaction', {
        transaction,
        type: NotificationType.TRANSACTION_DEBIT
      });
      return wallet;
    });
  }

  async processPaymentGatewaySuccess(
    addMoneyDto: AddMoneyThroughPGDTO,
    userId: string,
  ): Promise<Wallet> {
    return this.handleTransaction(async (queryRunner) => {
      const user = await this.findUserById(userId);
      const wallet = await this.findWalletByUserId(userId);

      if (addMoneyDto.amount < 0) {
        throw new BadRequestException('Amount cannot be negative');
      }
      let walletBalance = Number.parseFloat(wallet.balance?.toString());

      const rechargeDto = {
        ...addMoneyDto,
        transactionHash: generateHash(),
        user: user,
        type: TransactionType.CREDIT,
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
        type: NotificationType.TRANSACTION_CREDIT
      });
      return wallet;
    });
  }

  async processRechargeRefundPayment(
    orderId: string
  ): Promise<Wallet> {
    return this.handleTransaction(async (queryRunner) => {
      const order = await this.orderRepository.findOne({where: {order_id: orderId}, relations: {user: true}});
      order.amount = Number(order.amount);
      if (order) {
        const user = order.user;
        const wallet = await this.findWalletByUserId(user.id);
        if (!wallet) {
          throw new BadRequestException('wallet not found for user');
        }
        if (order.amount < 0) {
          throw new BadRequestException('Amount cannot be negative');
        }
        if (order.status !== OrderStatus.PENDING) {
          throw new BadRequestException('Order is not in pending state');
        }
        order.status = OrderStatus.FAILED;
        const transaction = await this.transactionRepo.findOne({where: {reference: orderId}});
        transaction.status = TransactionStatus.FAILED;
        await queryRunner.manager.save<Transaction>(transaction);
        await queryRunner.manager.save<Order>(order);
        await this.updateWalletBalance(wallet, order.amount, queryRunner, true);
        await this.notificationBridge.add('recharge', {
          order,
          transaction,
          type: NotificationType.RECHARGE_FAILED
        });
        return wallet;
      } else{
        throw new NotFoundException('order not found');
      }
    });
  }

  async processRechargeSuccess(
    orderId: string, transactionId: string, gatewayId: string
  ): Promise<boolean> {
    return this.handleTransaction(async (queryRunner) => {
      const order = await this.orderRepository.findOne({where: {order_id: orderId}});

      order.status = OrderStatus.SUCCESS;
      order.gateway_response = gatewayId;
      const transaction = await this.transactionRepo.findOne({where: {reference: orderId}});
      transaction.status = TransactionStatus.SUCCESS;
      order.transaction_id = transactionId;
      await queryRunner.manager.save<Transaction>(transaction);
      await queryRunner.manager.save<Order>(order);
      await this.notificationBridge.add('recharge', {
        order,
        transaction,
        type: NotificationType.RECHARGE_SUCCESS
      });
      return true
    });
  }

  async processLoanPayment(
    deductBalanceData: DeductWalletBalanceRechargeDto,
    userId: string,
  ): Promise<Wallet> {
    return this.handleTransaction(async (queryRunner) => {
      const user = await this.findUserById(userId);
      const wallet = await this.findWalletByUserId(userId);

      if (deductBalanceData.amount < 0) {
        throw new BadRequestException('Amount cannot be negative');
      }
      if (deductBalanceData.amount > wallet.balance) {
        throw new BadRequestException('Insufficient balance');
      }

      const rechargeDto = {
        ...deductBalanceData,
        transactionHash: generateHash(),
        user: user,
        type: TransactionType.DEBIT,
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

  async handleReferrelBonus(referrerUserId: string, refreeId: string) {
    return this.handleTransaction(async (queryRunner) => {
      try {
        const [referrer, refree, referrerWallet, refreeWallet, bonusAmount] = await Promise.all([
          this.findUserById(referrerUserId),
          this.findUserById(refreeId),
          this.findWalletByUserId(referrerUserId),
          this.findWalletByUserId(refreeId),
          this.getReferrelBonus()
        ]);
  
        if (!bonusAmount) return; // If no bonus amount, exit early
  
        // Create and save orders
        const [referrerOrder, refreeOrder] = await Promise.all([
          this.createAndSaveReferralOrder(bonusAmount, referrer),
          this.createAndSaveReferralOrder(bonusAmount, refree)
        ]);
  
        // Update wallet balances
        await Promise.all([
          this.updateWalletBalance(referrerWallet, bonusAmount, queryRunner, true),
          this.updateWalletBalance(refreeWallet, bonusAmount, queryRunner, true)
        ]);
  
        // Create transactions
        const [referrerTransaction, refreeTransaction] = this.createReferralTransactions(
          referrer, referrerOrder, referrerWallet, bonusAmount, refree,
          refreeOrder, refreeWallet
        );
  
        // Save transactions
        const [t1, t2] = await Promise.all([
          this.transactionsService.saveTransaction(referrerTransaction, queryRunner),
          this.transactionsService.saveTransaction(refreeTransaction, queryRunner)
        ]);
  
        // Send notifications
        await Promise.all([
          this.sendReferralBonusNotification(t1, refree, true),
          this.sendReferralBonusNotification(t2, referrer, false)
        ]);
  
      } catch (err) {
        console.error('Failed to add referral bonus', err);
      }
    });
  }

  async handleCoinRedeem(data: CoinTransaction) {
    return this.handleTransaction(async (queryRunner) => {
      if (data) {
        data.redemptionValue = Number.parseFloat(data.redemptionValue?.toString());
      }
      const userWallet = await this.walletRepository.findOneBy({user: {id: data.user.id}});
      const order = await this.createAndSaveCashbackOrder(data.redemptionValue, data.user);
      const transactionDto = {
        transactionHash: generateHash(),
        user: data.user,
        reference: order.order_id,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESS,
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
        type: NotificationType.CASHBACK_REDEEMED
      });
      return userWallet;
    });
  }
  
  private async createAndSaveReferralOrder(bonusAmount: number, user: User) {
    const order = this.orderRepository.create(this.getNewReferelOrder(bonusAmount, user));
    await this.orderRepository.save(order);
    return order;
  }

  private async createAndSaveCashbackOrder(amount: number, user: User) {
    const order = this.orderRepository.create(this.getNewCashbackOrder(amount, user));
    await this.orderRepository.save(order);
    return order;
  }

  
  private createReferralTransactions(
    referrer: User, referrerOrder: Order, referrerWallet: Wallet, bonusAmount: number,
    refree: User, refreeOrder: Order, refreeWallet: Wallet
  ) {
    const referrerTransaction = this.getTransactionModelForReferrel(
      referrer, referrerOrder.order_id, TransactionType.CREDIT, referrerWallet, bonusAmount, refree, 'Referral'
    );
    const refreeTransaction = this.getTransactionModelForReferrel(
      refree, refreeOrder.order_id, TransactionType.CREDIT, refreeWallet, bonusAmount, referrer, 'Referral'
    );
    return [referrerTransaction, refreeTransaction];
  }
  
  private async sendReferralBonusNotification(transaction: Transaction, counterPartyUser: User, isReferrer: boolean) {
    await this.notificationBridge.add('referrel', {
      transaction,
      isReferrer,
      counterPartyUser,
      type: NotificationType.REFERREL_BONUS
    });
  }
  

  getNewReferelOrder(amount: number, user: User) {
    return {
                order_id: generateRef(12),
                order_type: OrderType.PAYMENT,
                gateway_response: '',
                amount: amount,
                status: OrderStatus.SUCCESS,
                transaction_id: '',
                user: user,
                description: 'Referel earning',
                payment_method: 'WALLET',
                paymentMode: 'Referel',
                respectiveUserName: '',
                ifscNumber: '',
                accountId: ''
          }
  }
  getNewCashbackOrder(amount: number, user: User) {
    return {
                order_id: generateRef(12),
                order_type: OrderType.PAYMENT,
                gateway_response: '',
                amount: amount,
                status: OrderStatus.SUCCESS,
                transaction_id: '',
                user: user,
                description: 'cashback earning',
                payment_method: 'WALLET',
                paymentMode: 'Cashback',
                respectiveUserName: '',
                ifscNumber: '',
                accountId: ''
          }
  }

  getReferrelBonus() {
    const bonus = process.env.REFERREL_BONUS;
    return bonus ? Number.parseFloat(bonus) : 0;
  }

  getTransactionModelForReferrel(receiver: User, referenceId: string, transactionType: TransactionType, wallet: Wallet, amount: number, sender: User, serviceUsed: string) {
    const walletAmount = transactionType === TransactionType.CREDIT ? wallet.balance + amount : wallet.balance - amount
    return {
      transactionHash: generateHash(),
      reference: referenceId,
      user: receiver,
      description: 'Referrel Bonus',
      status: TransactionStatus.SUCCESS,
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
}
