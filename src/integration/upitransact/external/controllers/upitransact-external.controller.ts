import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhookPaymentRequestDto } from '../dto/webhook-payload.dto';
import { PaymentExternalService } from '../services/payment-external.service';

@Controller('external')
@ApiTags('External')
export class ExternalPaymentGatewayController {

  constructor(
    private externalService: PaymentExternalService
  ) {}
  
  @Post('payment')
  async handleKycEvents(@Body() payload: WebhookPaymentRequestDto) {
    console.log(`Payment Callback Received==test=======>: ${JSON.stringify(payload)}`);
    return this.externalService.handlePaymentCallback(payload);
  }
}
