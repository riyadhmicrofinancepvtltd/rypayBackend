import { Order } from 'src/core/entities/order.entity';
import { Transaction } from 'src/core/entities/transactions.entity';
import { User } from 'src/core/entities/user.entity';
import { WalletService } from 'src/wallet/services/wallet.service';
import { Repository } from 'typeorm';
import { PayoutClientService } from '../../external-system-client/payout-client.service';
import { AccountPayoutPayload } from '../dto/payout-payload.dto';
import { VerifyAccountRequestDTO } from '../dto/verify-account-request.dto';
import { VerifyAccountResponseDTO } from '../dto/verify-account-response.dto';
import { VerifyUpiRequestDTO } from '../dto/verify-upi-request.dto';
import { UPIPayoutPayload } from '../dto/upi-account-payload.dto';
export declare class PayoutService {
    private walletService;
    private payloutClientService;
    private orderRepository;
    private userRepository;
    private transactionRepository;
    private readonly logger;
    private readonly DAILY_LIMIT;
    private readonly MONTHLY_LIMIT;
    constructor(walletService: WalletService, payloutClientService: PayoutClientService, orderRepository: Repository<Order>, userRepository: Repository<User>, transactionRepository: Repository<Transaction>);
    payoutAccount(userId: string, requestDto: AccountPayoutPayload): Promise<{
        referenceId: string;
        amount: number;
        message: string;
    }>;
    validatePayout(userId: string, amount: number, serviceUsed: string): Promise<void>;
    validateTransactionLimit(userId: string, amount: number, serviceUsed: string): Promise<void>;
    payoutUPI(userId: string, requestDto: UPIPayoutPayload): Promise<{
        referenceId: string;
        amount: number;
        message: string;
    }>;
    payoutUPINew(userId: string, requestDto: UPIPayoutPayload): Promise<{
        referenceId: string;
        amount: number;
        message: string;
    }>;
    verifyAccount(verifyDto: VerifyAccountRequestDTO): Promise<VerifyAccountResponseDTO>;
    verifyUpi(verifyDto: VerifyUpiRequestDTO): Promise<VerifyAccountResponseDTO>;
}
