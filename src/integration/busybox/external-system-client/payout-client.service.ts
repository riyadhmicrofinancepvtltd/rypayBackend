import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  TransactionDto,
  TransactionResponse,
} from '../external/interfaces/transaction.interface';
import { AccessTokenClientService } from './access-token-client.service';
import { AxiosResponse } from 'axios';
import { IAccountPayoutRequestBody } from '../external/interfaces/payout/payout-request-body.interface';
import { IAccountPayoutResponseDTO } from '../external/interfaces/payout/payout-response-body.interface';
import { IVerifyAccountRequestDTO } from '../external/interfaces/validation/verify-account-request.interface';
import { IVerifyAccountResponseDTO } from '../external/interfaces/validation/verify-account-response.interface';
import { IVerifyUPIRequestDTO } from '../external/interfaces/validation/verify-upi-request.interface';
import { IVerifyUpiResponseDTO } from '../external/interfaces/validation/verify-upi-response.interface copy';
import { IUPIPayoutRequestBody } from '../external/interfaces/payout/payout-upi-request-body.interface';
import { PayoutBalance } from '../external/interfaces/payout/payout-balance-response.interface';

@Injectable()
export class PayoutClientService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private accessTokenService: AccessTokenClientService,
  ) {}

  /**
   * Performs a payout transaction from the pool balance to the given account number.
   * checks the account number and IFSC first from the validation api
   * @param {IAccountPayoutRequestBody} data - The data required for the payout.
   * @returns {Promise<IAccountPayoutResponseDTO>} - The response from the external API, containing the status and transaction details.
   * @throws {Error} - Throws an error if the request fails.
   */
  async payoutUsingAccount(data: IAccountPayoutRequestBody): Promise<IAccountPayoutResponseDTO> {
    const config = await this.accessTokenService.getHeaderConfig(true);
    try {
      const response = await firstValueFrom(
        this.httpService.post<IAccountPayoutResponseDTO>(
          `${this.configService.get('BUSY_BOX_PAYOUT_API_BASE_URL')}/payment/payment`,
          data,
          config,
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Pool Balance of the account.
   * @returns {Promise<IAccountPayoutResponseDTO>} - The response from the external API, containing the status and transaction details.
   * @throws {Error} - Throws an error if the request fails.
   */
  async getPoolBalance(): Promise<PayoutBalance> {
    const config = await this.accessTokenService.getHeaderConfig(true);
    try {
      const response = await firstValueFrom(
        this.httpService.get<PayoutBalance>(
          `${this.configService.get('BUSY_BOX_PAYOUT_API_BASE_URL')}/payment/balance`,
          config,
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

   /**
   * Performs a payout transaction from the pool balance to the given UPI id.
   * @param {IAccountPayoutRequestBody} data - The data required for the payout.
   * @returns {Promise<IAccountPayoutResponseDTO>} - The response from the external API, containing the status and transaction details.
   * @throws {Error} - Throws an error if the request fails.
   */
   async payoutUsingUPI(data: IUPIPayoutRequestBody): Promise<IAccountPayoutResponseDTO> {
    const config = await this.accessTokenService.getHeaderConfig(true);
    try {
      const response = await firstValueFrom(
        this.httpService.post<IAccountPayoutResponseDTO>(
          `${this.configService.get('BUSY_BOX_PAYOUT_API_BASE_URL')}/payment/upi`,
          data,
          config,
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * checks the account number and IFSC
   * @param {IAccountPayoutRequestBody} data - The data required for the payout.
   * @returns {Promise<IAccountPayoutResponseDTO>} - The response from the external API, containing the status and transaction details.
   * @throws {Error} - Throws an error if the request fails.
   */
  async verifyAccount(data: IVerifyAccountRequestDTO): Promise<IVerifyAccountResponseDTO> {
    const config = await this.accessTokenService.getHeaderConfig(true);
    try {
      const response = await firstValueFrom(
        this.httpService.post<IVerifyAccountResponseDTO>(
          `${this.configService.get('BUSY_BOX_PAYOUT_API_BASE_URL')}/verify/account`,
          data,
          config,
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * checks the account number and IFSC
   * @param {IAccountPayoutRequestBody} data - The data required for the payout.
   * @returns {Promise<IAccountPayoutResponseDTO>} - The response from the external API, containing the status and transaction details.
   * @throws {Error} - Throws an error if the request fails.
   */
  async verifyUpi(data: IVerifyUPIRequestDTO): Promise<IVerifyUpiResponseDTO> {
    const config = await this.accessTokenService.getHeaderConfig(true);
    try {
      const response = await firstValueFrom(
        this.httpService.post<IVerifyUpiResponseDTO>(
          `${this.configService.get('BUSY_BOX_PAYOUT_API_BASE_URL')}/verify/upi`,
          data,
          config,
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
