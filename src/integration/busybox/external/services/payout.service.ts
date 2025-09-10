import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus, OrderType } from 'src/core/entities/order.entity';
import { Transaction, TransactionStatus } from 'src/core/entities/transactions.entity';
import { User } from 'src/core/entities/user.entity';
import { generateRef, maskAccount } from 'src/core/utils/hash.util';
import { WalletService } from 'src/wallet/services/wallet.service';
import { Repository } from 'typeorm';
import { PayoutClientService } from '../../external-system-client/payout-client.service';
import { PayoutDescription } from '../constants/external.constant';
import { AccountPayoutPayload } from '../dto/payout-payload.dto';
import { IAccountPayoutRequestBody } from '../interfaces/payout/payout-request-body.interface';
import { VerifyAccountRequestDTO } from '../dto/verify-account-request.dto';
import { IVerifyAccountRequestDTO } from '../interfaces/validation/verify-account-request.interface';
import { VerifyAccountResponseDTO } from '../dto/verify-account-response.dto';
import { VerifyUpiRequestDTO } from '../dto/verify-upi-request.dto';
import { IVerifyUPIRequestDTO } from '../interfaces/validation/verify-upi-request.interface';
import { UPIPayoutPayload } from '../dto/upi-account-payload.dto';
import { IUPIPayoutRequestBody } from '../interfaces/payout/payout-upi-request-body.interface';
import { getIMPSOrRTGSCharges } from 'src/core/utils/payment.utils';
@Injectable()
export class PayoutService {
    private readonly logger: Logger;
    private readonly DAILY_LIMIT = {
        UPI: 10000,
        Payout: 25000,
    };
    
    private readonly MONTHLY_LIMIT = {
    UPI: 100000,
    Payout: 200000,
    };
    constructor(
        private walletService: WalletService,
        private payloutClientService: PayoutClientService,
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>

    ) {
       this.logger =  new Logger(PayoutService.name)
    }

    async payoutAccount(userId: string, requestDto: AccountPayoutPayload) {
        const serviceUsed = 'Payout';
        await this.validatePayout(userId, requestDto.amount, serviceUsed);
        const requestBody: IAccountPayoutRequestBody = {
            account_number: requestDto.accountNumber,
            amount: requestDto.amount,
            ifsc_code: requestDto.ifsc,
            mobile: requestDto.mobile,
            mode: requestDto.mode
        }
        const response = (await this.payloutClientService.payoutUsingAccount(requestBody));

        if (response.status === 'FAILURE') {
            throw new BadRequestException(response.message)
        }
        const user = await this.userRepository.findOne({where: {id: userId}});
        const maskedAccount = maskAccount(requestBody.account_number);
        const description = requestDto.message ? requestDto.message : PayoutDescription.replace('{maskedAccount}', maskedAccount);
        const orderId = generateRef(12);
        const payoutCharges = requestDto.mode?.toLowerCase() === 'neft' ? 0 : getIMPSOrRTGSCharges(requestDto.amount);
        const order = {
            order_id: orderId,
            order_type: OrderType.PAYOUT,
            gateway_response: '',
            amount: requestDto.amount,
            status: OrderStatus.PENDING,
            transaction_id: response.stan?.toString(),
            user: user,
            description: description,
            payment_method: 'WALLET',
            paymentMode: requestDto.mode,
            charges: payoutCharges,
            respectiveUserName: requestDto.userName ?? "",
            ifscNumber: requestDto.ifsc,
            accountId: requestDto.accountNumber
        }
        const SavedOrder = this.orderRepository.create(order);
        this.orderRepository.save(SavedOrder);

        await this.walletService.processRechargePayment({amount: requestDto.amount,
             receiverId: requestDto.accountNumber,
             serviceUsed: serviceUsed,
             charges: payoutCharges,
             description: description,
             status: TransactionStatus.PENDING,
             reference: orderId }, userId);

        return {
            referenceId: SavedOrder.order_id,
            amount: +response.amount,
            message: description
        }
    }


    async payoutAccountNew(userId: string, requestDto: AccountPayoutPayload) {
        const serviceUsed = 'Payout';
        await this.validatePayoutNew(userId, requestDto.amount, serviceUsed);
        const requestBody: IAccountPayoutRequestBody = {
            account_number: requestDto.accountNumber,
            amount: requestDto.amount,
            ifsc_code: requestDto.ifsc,
            mobile: requestDto.mobile,
            mode: requestDto.mode
        }
        const response = (await this.payloutClientService.payoutUsingAccount(requestBody));

        if (response.status === 'FAILURE') {
            throw new BadRequestException([response.message])
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const maskedAccount = maskAccount(requestBody.account_number);
        const description = requestDto.message ? requestDto.message : PayoutDescription.replace('{maskedAccount}', maskedAccount);
        const orderId = generateRef(12);
        const payoutCharges = requestDto.mode?.toLowerCase() === 'neft' ? 0 : getIMPSOrRTGSCharges(requestDto.amount);
        const order = {
            order_id: orderId,
            order_type: OrderType.PAYOUT,
            gateway_response: '',
            amount: requestDto.amount,
            status: OrderStatus.PENDING,
            transaction_id: response.stan?.toString(),
            user: user,
            description: description,
            payment_method: 'WALLET',
            paymentMode: requestDto.mode,
            charges: payoutCharges,
            respectiveUserName: requestDto.userName ?? "",
            ifscNumber: requestDto.ifsc,
            accountId: requestDto.accountNumber
        }
        const SavedOrder = this.orderRepository.create(order);
        this.orderRepository.save(SavedOrder);

        await this.walletService.processRechargePayment({
            amount: requestDto.amount,
            receiverId: requestDto.accountNumber,
            serviceUsed: serviceUsed,
            charges: payoutCharges,
            description: description,
            status: TransactionStatus.PENDING,
            reference: orderId
        }, userId);

        return {
            referenceId: SavedOrder.order_id,
            amount: +response.amount,
            message: description
        }
    }

    async validatePayout(userId: string, amount: number, serviceUsed: string) {
        const user = await this.userRepository.findOne({where: {id: userId}});
        const poolBalance = +(await this.payloutClientService.getPoolBalance()).balance;
        if (!user) {
            throw new ForbiddenException('User does not exist')
        }
        const wallet = await this.walletService.getWallet({user: {id: userId}});
        if (wallet.balance < amount) {
            throw new BadRequestException('Insufficient Balance')
        }
        if (poolBalance < amount) {
            throw new BadRequestException('Technical Error! Please try after some time');
        }
        await this.validateTransactionLimit(userId, amount, serviceUsed);
    }
    async validatePayoutNew(userId: string, amount: number, serviceUsed: string) {
        const user = await this.userRepository.findOne({where: {id: userId}});
        const poolBalance = +(await this.payloutClientService.getPoolBalance()).balance;
        if (!user) {
            throw new ForbiddenException('User does not exist')
        }
        const wallet = await this.walletService.getWallet({user: {id: userId}});
        console.log("poolBalance====>",poolBalance);
        console.log("amount.balance====>",amount);
        if (wallet.balance < amount) {
            throw new BadRequestException(['Insufficient Balance'])
        }
        if (poolBalance < amount) {
            throw new BadRequestException(['Technical Error! Please try after some time']);
        }
        await this.validateTransactionLimit(userId, amount, serviceUsed);
    }
    
    async validateTransactionLimit(userId: string, amount: number, serviceUsed: string) {

        // Get start of day and month timestamps
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch total transactions for today and this month
        const [dailyTotal, monthlyTotal] = await Promise.all([
            this.transactionRepository
            .createQueryBuilder('t')
            .where('t.userId = :userId', { userId: userId })
            .andWhere('t.serviceUsed = :serviceUsed', { serviceUsed })
            .andWhere('t.type = :transactionType', { transactionType: 'DEBIT' })
            .andWhere('t.createdAt >= :startOfDay', { startOfDay })
            .select('COALESCE(SUM(t.amount), 0)', 'total')
            .getRawOne(),

            this.transactionRepository
            .createQueryBuilder('t')
            .where('t.userId = :userId', { userId: userId })
            .andWhere('t.serviceUsed = :serviceUsed', { serviceUsed })
            .andWhere('t.type = :transactionType', { transactionType: 'DEBIT' })
            .andWhere('t.createdAt >= :startOfMonth', { startOfMonth })
            .select('COALESCE(SUM(t.amount), 0)', 'total')
            .getRawOne(),
        ]);

        const dailySpent = parseFloat(dailyTotal?.total || '0');
        const monthlySpent = parseFloat(monthlyTotal?.total || '0');

        // Check limits
        if (dailySpent + amount > this.DAILY_LIMIT[serviceUsed]) {
            throw new BadRequestException(`Daily limit exceeded for ${serviceUsed}. Allowed: Rs. ${this.DAILY_LIMIT[serviceUsed]}`);
        }

        if (monthlySpent + amount > this.MONTHLY_LIMIT[serviceUsed]) {
            throw new BadRequestException(`Monthly limit exceeded for ${serviceUsed}. Allowed: Rs. ${this.MONTHLY_LIMIT[serviceUsed]}`);
        }
    }

    async payoutUPI(userId: string, requestDto: UPIPayoutPayload) {
        const serviceUsed = 'UPI';
        await this.validatePayout(userId, requestDto.amount, serviceUsed);
        const requestBody: IUPIPayoutRequestBody = {
            account_number: requestDto.upiId,
            amount: requestDto.amount,
            mobile: requestDto.mobile,
            mode: serviceUsed
        }
        const response = (await this.payloutClientService.payoutUsingUPI(requestBody));

        if (response.status === 'FAILURE') {
            throw new BadRequestException(response.message)
        }
        const user = await this.userRepository.findOne({where: {id: userId}});
        const maskedAccount = maskAccount(requestBody.account_number);
        const description = requestDto.message ? requestDto.message : PayoutDescription.replace('{maskedAccount}', maskedAccount);
        const orderId = generateRef(12);
        const order = {
            order_id: orderId,
            order_type: OrderType.UPI_PAYOUT,
            gateway_response: '',
            amount: requestDto.amount,
            status: OrderStatus.PENDING,
            transaction_id: response.stan?.toString(),
            user: user,
            description: description,
            payment_method: 'WALLET',
            respectiveUserName: requestDto.upiUserName,
            ifscNumber: null,
            paymentMode: serviceUsed,
            accountId: requestDto.upiId
        }
        const SavedOrder = this.orderRepository.create(order);
        this.orderRepository.save(SavedOrder);

        await this.walletService.processRechargePayment({amount: requestDto.amount,
             receiverId: requestDto.upiId,
             serviceUsed: serviceUsed,
             description: description,
             status: TransactionStatus.PENDING,
             reference: orderId }, userId);
        return {
            referenceId: SavedOrder.order_id,
            amount: +response.amount,
            message: description
        }
    }


    async payoutUPINew(userId: string, requestDto: UPIPayoutPayload) {
        const serviceUsed = 'UPI';
        await this.validatePayout(userId, requestDto.amount, serviceUsed);
        const requestBody: IUPIPayoutRequestBody = {
            account_number: requestDto.upiId,
            amount: requestDto.amount,
            mobile: requestDto.mobile,
            mode: serviceUsed
        }
        const response = (await this.payloutClientService.payoutUsingUPI(requestBody));

        if (response.status === 'FAILURE') {
            throw new BadRequestException(response.message)
        }
        const user = await this.userRepository.findOne({where: {id: userId}});
        const maskedAccount = maskAccount(requestBody.account_number);
        const description = requestDto.message ? requestDto.message : PayoutDescription.replace('{maskedAccount}', maskedAccount);
        const orderId = generateRef(12);
        const order = {
            order_id: orderId,
            order_type: OrderType.UPI_PAYOUT,
            gateway_response: '',
            amount: requestDto.amount,
            status: OrderStatus.PENDING,
            transaction_id: response.stan?.toString(),
            user: user,
            description: description,
            payment_method: 'WALLET',
            respectiveUserName: requestDto.upiUserName,
            ifscNumber: null,
            paymentMode: serviceUsed,
            accountId: requestDto.upiId
        }
        const SavedOrder = this.orderRepository.create(order);
        this.orderRepository.save(SavedOrder);

        await this.walletService.processRechargePayment({amount: requestDto.amount,
             receiverId: requestDto.upiId,
             serviceUsed: serviceUsed,
             description: description,
             status: TransactionStatus.PENDING,
             reference: orderId }, userId);
        return {
            referenceId: SavedOrder.order_id,
            amount: +response.amount,
            message: description
        }
    }

    async verifyAccount(verifyDto: VerifyAccountRequestDTO) {
        const payload: IVerifyAccountRequestDTO = {
            account_number: verifyDto.accountNumber,
            ifsc_code: verifyDto.ifscCode
        }
        const data = await this.payloutClientService.verifyAccount(payload)
        if (data.resp_code === "S0200") {
            return <VerifyAccountResponseDTO>{
                message: data.message,
                accountNumber: data.account_number,
                ifscCode: data.ifsc_code,
                nameInBank: data.NameInBank
            };
        }
        else if(data.resp_code === "E0404") {
            throw new NotFoundException(data.message);
        }
        throw new BadRequestException(data.message);
    }

    async verifyUpi(verifyDto: VerifyUpiRequestDTO) {
        console.log("verifyDto====>",verifyDto);
        const payload: IVerifyUPIRequestDTO = {
            upi_vpa: verifyDto.upiId
        }
        const data = await this.payloutClientService.verifyUpi(payload)
        console.log("data====>",data);
        if (data.resp_code === "S0200") {
            return <VerifyAccountResponseDTO>{
                message: data.message,
                accountNumber: data.account_number,
                ifscCode: data.ifsc_code,
                nameInBank: data.NameInBank
            };
        } else if(data.resp_code === "E0404") {
            throw new NotFoundException(data.message);
        }
        throw new BadRequestException(data.message);
    }
}
