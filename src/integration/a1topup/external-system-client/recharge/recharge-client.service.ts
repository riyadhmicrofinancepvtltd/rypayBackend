import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { InjectPinoLogger, Logger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';
import { RedisKeyConstant } from '../../external/constants/integration.constant';
import { FetchBillRequestPayload } from '../../external/interfaces/fetch-bill-request.interface';
import { IFetchBillResponse } from '../../external/interfaces/fetch-bill-response.interface';
import { IMobileProviderResponse } from '../../external/interfaces/mobile-provider-info.interface';
import { ICircleApiResponse, IOperatorApiResponse } from '../../external/interfaces/operator-response.interface';
import { IRechargePlanApiResponse } from '../../external/interfaces/recharge-plans-api-response.interface';
import { IPrepaidOrDTHRechargeRequest, RechargeRequest } from '../../external/interfaces/recharge-request-body.interface';
import { IRechargeResponse } from '../../external/interfaces/recharge-response.interface';
import { IUtilityBillPaymentRequest } from '../../external/interfaces/utility-bill-payment-request.interface';
import { UtilityBillAPIResponse } from '../../external/interfaces/utility-bill-response.interface';
import { IRegisterOutletRequestPayload } from '../../external/interfaces/register-outlet.interface';
import { RegisterOutletResponseData } from '../../external/interfaces/register-outlet-response.interface';
import { OtpVerificationResponse, RegisterOutletOtpRequestModel } from '../../external/interfaces/register-outlet-verify.interface';
import { OutletStatusRequestModel } from '../../external/interfaces/outlet-status.interface';
import { AEPSBankListResponse } from '../../external/interfaces/aeps-bank-response.interface';
import { OutletLoginRequestModel, OutletLoginResponseModel } from '../../external/interfaces/outlet-login.interface';
import { AEPSMiniStatementRequestModel, AEPSMiniStatementResponseModel } from '../../external/interfaces/aeps-mini-statement.interface';
import { AEPSWithdrawalRequestModel, AEPSWithdrawalResponseModel } from '../../external/interfaces/aeps-withdrawal.interface';

@Injectable()
export class RechargeClientService {
  private readonly apiBaseUrl: string;
  private readonly apiToken: string;
  constructor(
    private readonly httpService: HttpService,
    @InjectPinoLogger(RechargeClientService.name) private logger: Logger,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.apiBaseUrl = this.configService.get<string>('RECHARGE_API_BASE_URL');
    this.apiToken = this.configService.get('RECHARGE_API_SECRET_KEY');
  }

  /***
   * this method will recharge prepaid, dth and electricity operators
   */
  async initRecharge(rechargePayload: RechargeRequest): Promise<IRechargeResponse> {

    const body = {
      token: this.apiToken,
      ...rechargePayload,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/transaction.php`, body)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Recharge API error:', error);
      throw error;
    }
  }

  async registerOutlet(requestData: IRegisterOutletRequestPayload): Promise<RegisterOutletResponseData> {
    const body = {
      token: this.apiToken,
      ...requestData, // Spread the requestData to include all the fields
      transType: 'outletRegister', // Transaction type for outlet registration
    };

    try {
      // Send the POST request using httpService and firstValueFrom to handle the response
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      
      // Return the response data
      return response.data; 
    } catch (error) {
      this.logger.error('Outlet registration request error:', error);
      throw error;
    }
  }

  async verifyOtpForOutletRegistration(requestData: RegisterOutletOtpRequestModel): Promise<OtpVerificationResponse> {
    const body = {
      token: this.apiToken,
      ...requestData, // Spread the requestData to include all the fields
      transType: 'outletRegisterVerify', // Transaction type for outlet registration OTP verification
    };

    try {
      // Send the POST request using httpService and firstValueFrom to handle the response
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      
      // Return the response data
      return response.data; 
    } catch (error) {
      this.logger.error('OTP verification request error:', error);
      throw error;
    }
  }

  async checkOutletStatus(requestData: OutletStatusRequestModel) {
    const body = {
      token: this.apiToken,
      ...requestData, // Spread the requestData to include all the fields
      transType: 'outletStatus', // Transaction type for checking outlet status
    };

    try {
      // Send the POST request using httpService and firstValueFrom to handle the response
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      
      // Return the response data
      return response.data; 
    } catch (error) {
      this.logger.error('Outlet status check request error:', error);
      throw error;
    }
  }

  async getAEPSSupportedBankList(): Promise<AEPSBankListResponse> {
    const body = {
      token: this.apiToken,
      transType: 'aepsBankList', // Transaction type for AEPS bank list
    };

    try {
      // Send the POST request using httpService and firstValueFrom to handle the response
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      
      // Return the response data
      return response.data; 
    } catch (error) {
      this.logger.error('AEPS supported bank list request error:', error);
      throw error;
    }
  }

  async outletLogin(loginData: OutletLoginRequestModel): Promise<OutletLoginResponseModel> {
    const body = {
      token: this.apiToken,
      ...loginData, // Spread the requestData to include all the fields
      transType: 'outletAepsLogin', // Transaction type for outlet login
    };

    try {
      // Send the POST request using httpService and firstValueFrom to handle the response
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      
      // Return the response data
      return response.data; 
    } catch (error) {
      this.logger.error('Outlet login request error:', error);
      throw error;
    }
  }

  async getAepsMiniStatement(miniStatementData: AEPSMiniStatementRequestModel): Promise<AEPSMiniStatementResponseModel> {
    const body = {
      token: this.apiToken,
      ...miniStatementData,
    };

    try {
      // Send the POST request using httpService and firstValueFrom to handle the response
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/transaction.php`, body)
      );
      
      // Return the response data
      return response.data; 
    } catch (error) {
      this.logger.error('AEPS MiniStatement request error:', error);
      throw error;
    }
  }

  async getAepsWithdrawal(withdrawalData: AEPSWithdrawalRequestModel): Promise<AEPSWithdrawalResponseModel> {
    const body = {
      token: this.apiToken,
      ...withdrawalData, // Spread the withdrawal data to include all required fields
    };

    try {
      // Send the POST request using httpService and firstValueFrom to handle the response
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/transaction.php`, body)
      );
      
      // Return the response data
      return response.data;
    } catch (error) {
      this.logger.error('AEPS Withdrawal request error:', error);
      throw error;
    }
  }

  async requestAadharOtp(aadharNumber: string) {
    const urid = Math.floor(100000000 + Math.random() * 900000000);
    const body = {
      token: this.apiToken,
      aadhaarNumber: aadharNumber,
      transType: 'aadhaarSendOtp',
      urid: urid.toString(), 
    };

    console.log("send payload==>",body);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Aadhar eKYC request error :', error);
      throw error;
    }
  }
  async validateUPI(upiId: string) {
    const urid = Math.floor(100000000 + Math.random() * 900000000);
    const body = {
      token: this.apiToken,
      upiId: upiId,
      urid: urid.toString(), 
      transType: 'upiName',
    };
   
    console.log("send payload==>",body);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Aadhar eKYC request error :', error);
      throw error;
    }
  }

  async validateAadharOtp(aadharNumber: string, otp: string, sessionId: string) {
    const urid = Math.floor(100000000 + Math.random() * 900000000);
    const body = {
      token: this.apiToken,
      aadhaarNumber: aadharNumber,
      otp: otp,
      otpSessionId: sessionId,
      transType:"aadhaarVerifyOtp",
      urid: urid.toString(),
    };

    console.log("verify payload==>",body);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Aadhar eKYC validation error :', error);
      throw error;
    }
  }

  /***
   * this method will pay bills for home utilities
   * electricity
   * water
   * gas 
   */
  async initUtilityPayment(utilityPayload: IUtilityBillPaymentRequest): Promise<UtilityBillAPIResponse> {

    const params = {
      token: this.apiToken,
      ...utilityPayload,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/transaction.php`, { params })
      );
      return response.data;
    } catch (error) {
      this.logger.error('Bill payment API error:', error);
      throw error;
    }
  }

  // async getTransactionStatus(orderid: string): Promise<IClientApiGenericResponse<TransactionStatusResponse>> {

  //   const params = {
  //     api_key: this.getApiKey(),
  //     order_id: orderid,
  //   };

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(`${this.apiBaseUrl}/status.php`, { params })
  //     );
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error('Transaction Status API error:', error);
  //     throw error;
  //   }
  // }

  async getServiceProvidersList(): Promise<IOperatorApiResponse> {
    const body = {
      token: this.apiToken
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/operatorList.php`, body)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Service provider list error:', error);
      throw error;
    }
  }

  async getMobileProviderInfo(mobile: string): Promise<IMobileProviderResponse> {
    const params = {
      token: this.apiToken,
      number: mobile
    }
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/operator_fetch.php`, { params })
      );
      return response.data;
    } catch (error) {
      this.logger.error('get mobile provider info error:', error);
      throw error;
    }
  }

  async fetchBill(billPayload: FetchBillRequestPayload): Promise<IFetchBillResponse> {
    const body = {
      token: this.apiToken,
      ...billPayload
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/transaction.php`, body)
      );
      return response.data;
    } catch (error) {
      this.logger.error('get bill details error:', error);
      throw error;
    }
  }

  async getCircleCodeList(): Promise<ICircleApiResponse> {
    const body = {
      token: this.apiToken
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/utility/stateList.php`, body)
      );
      return response.data;
    } catch (error) {
      this.logger.error('state list API error:', error);
      throw error;
    }
  }

  async getRechargePlansList(operatorId: string): Promise<IRechargePlanApiResponse> {
    const params = {
      token: this.apiToken,
      operatorId: operatorId,
      transType: 'mobilePlan'
    }
    const rechargePlanKey = `recharge_${operatorId}`;
    try {
      const cachedData = await this.cacheManager.get<IRechargePlanApiResponse>(rechargePlanKey);
      if (cachedData) {
        return cachedData;
      }
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/utility/transaction.php`, { params })
      );
      await this.cacheManager.set(rechargePlanKey, response.data, RedisKeyConstant.PlanApiTTL)
      return response.data;
    } catch (error) {
      this.logger.error('Recharge plans API error:', error);
      throw error;
    }
  }

  async getCurrentBalance(): Promise<string> {
    const username = this.configService.get<string>('RECHARGE_API_USERNAME');
    const password = this.configService.get<string>('RECHARGE_API_PASSWORD');

    const params = {
      username,
      pwd: password,
      format: 'json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/balance`, { params })
      );
      return response.data;
    } catch (error) {
      this.logger.error('Recharge Status API error:', error);
      throw error;
    }
  }
}
