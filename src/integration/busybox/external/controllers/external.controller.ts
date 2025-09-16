import { Body, Controller, Post,Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TransactionNotifyPayload } from '../interfaces/transaction-notify.interface';
import { KycWebhookPayload } from '../interfaces/kyc-webhook-payload.interface';
import { WalletService } from 'src/wallet/services/wallet.service';
import { ExternalService } from '../services/external.service';
import { TransactionDto } from '../interfaces/upi-transaction-payload.dto';

@Controller('external')
@ApiTags('External')
export class ExternalController {

  constructor(
    private externalService: ExternalService
  ) {

  }
  @Post('transactions')
  async handleTransactions(@Body() payload: TransactionNotifyPayload) {
    return this.externalService.handleCardtransactions(payload);
    //webhook processing logic
  }

  @Post('kyc-events')
  async handleKycEvents(@Body() payload: KycWebhookPayload) {
    return this.externalService.handleKycEvents(payload);
    // webhook processing logic
  }

  @Post('debit')
  async handleDebitEvents(@Body() payload: TransactionDto) {
    return this.externalService.handleDebitEvents(payload);
    // webhook processing logic
  }

  @Post('upi')
  async handleUpiEvents(@Body() payload: TransactionDto) {
    return this.externalService.handleUpiEvents(payload);
    // webhook processing logic
  }

  @Post('webhooks/payouts')
  async handlePayoutEvents(@Body() payload: TransactionDto) {
    return this.externalService.handlePayoutEvents(payload);
    // webhook processing logic
  }

  // @Post('webhooks/busybox')
  // async handleBusyBoxPayoutEvents(@Body() payload: TransactionDto) {
  //   return this.externalService.handleBusyBoxPayoutEvents(payload);
  //   // webhook processing logic
  // }
  @Post('webhooks/busybox')
  async handleBusyBoxPayoutEvents(@Body() payload: any, @Req() req: Request) {
    console.log('📥 Raw payload string:', JSON.stringify(req.body, null, 2));
    console.log('📥 Parsed payload object:', payload);

    return this.externalService.handleBusyBoxPayoutEvents(payload);
  }
}
