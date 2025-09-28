import { PaymentExternalService } from '../services/payment-external.service';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { MergedDataResponseDTO, TransactionHistoryDTO } from '../dto/settlement-history.dto';
import { PaymentExternalClientService } from '../../external-system-client/payment-external-client.service';
export declare class PaymentGatewayController {
    private externalService;
    private resellerExternalCLient;
    constructor(externalService: PaymentExternalService, resellerExternalCLient: PaymentExternalClientService);
    handleKycEvents(req: any, payload: PaymentRequestDto): Promise<{
        referenceId: string;
        amount: number;
        message: string;
    }>;
    getMergedData(startDate: string, endDate: string, merchantId?: string): Promise<MergedDataResponseDTO>;
    getTransactionsData(startDate: string, endDate: string, merchantId?: string): Promise<TransactionHistoryDTO[]>;
}
