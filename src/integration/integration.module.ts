import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-store';
import { CardsService } from 'src/cards/services/cards.service';
import { BusyBoxWebhookResponse } from 'src/core/entities/busybox_webhook_logs.entity';
import { Card } from 'src/core/entities/card.entity';
import { UserDocument } from 'src/core/entities/document.entity';
import { Order } from 'src/core/entities/order.entity';
import { OtpInfo } from 'src/core/entities/otp-info.entity';
import { Transaction } from 'src/core/entities/transactions.entity';
import { User } from 'src/core/entities/user.entity';
import {VirtualAccount} from 'src/core/entities/virtual-account.entity'
import { TransactionMoney } from 'src/core/entities/transaction-money.entity';
import { Wallet } from 'src/core/entities/wallet.entity';
import { WebhookResponse } from 'src/core/entities/webhook.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { OtpRepository } from 'src/notifications/repository/otp.repository';
import { MailService } from 'src/notifications/services/mail.service';
import { OtpFlowService } from 'src/notifications/services/otp-flow.service';
import { SmsClientService } from 'src/notifications/sms-client.service';
import { PdfService } from 'src/pdf/services/pdf.service';
import { TransactionsService } from 'src/transactions/services/transactions.service';
import { UploadFileService } from 'src/users/services/updaload-file.service';
import { UsersService } from 'src/users/services/users.service';
import { WalletBridge } from 'src/wallet/services/wallet.queue';
import { WalletService } from 'src/wallet/services/wallet.service';
import { RechargeClientService } from './a1topup/external-system-client/recharge/recharge-client.service';
import { RechargeExternalController } from './a1topup/external/controllers/recharge-external.controller';
import { AccessTokenClientService } from './busybox/external-system-client/access-token-client.service';
import { CardsClientService } from './busybox/external-system-client/cards-client.service';
import { MerchantClientService } from './busybox/external-system-client/merchant-client.service';
import { PayoutClientService } from './busybox/external-system-client/payout-client.service';
import { TransactionsClientService } from './busybox/external-system-client/transactions-client.service';
import { ExternalController } from './busybox/external/controllers/external.controller';
import { PayoutController } from './busybox/external/controllers/payout.controller';
import { SseController } from './busybox/external/controllers/recharge-sse.controller';
import { ExternalService } from './busybox/external/services/external.service';
import { PayoutService } from './busybox/external/services/payout.service';
import { SseService } from './busybox/external/services/sse-service';
import { BullModule } from '@nestjs/bull';
import { CoinsModule } from 'src/coins/coins.module';
import { AadharResponse } from 'src/core/entities/aadhar-verification.entity';
import { ExternalPaymentGatewayController } from './upitransact/external/controllers/upitransact-external.controller';
import { PaymentGatewayController } from './upitransact/external/controllers/upitransact.controller';
import { PaymentExternalService } from './upitransact/external/services/payment-external.service';
import { PaymentExternalClientService } from './upitransact/external-system-client/payment-external-client.service';

@Module({
  imports: [
    CacheModule.register({
    store: redisStore as any,
    host: 'localhost', //default host
    port: 6379 //default port
  }),
    BullModule.registerQueue({name: 'wallet'}),
    HttpModule, ConfigModule,
    NotificationsModule,
    CoinsModule,
    TypeOrmModule.forFeature([Wallet, User,VirtualAccount,TransactionMoney, Order, Transaction, Card, BusyBoxWebhookResponse, WebhookResponse, UserDocument, OtpInfo, AadharResponse])
  ],
  providers: [
    MerchantClientService,
    CardsClientService,
    WalletService,
    PdfService,
    UsersService,
    UploadFileService,
    CardsService,
    TransactionsService,
    AccessTokenClientService,
    TransactionsClientService,
    ExternalService,
    PaymentExternalClientService,
    PaymentExternalService,
    SseService,
    RechargeClientService,
    PayoutClientService,
    PayoutService,
    OtpFlowService,
    SmsClientService,
    MailService,
    WalletBridge,
    OtpRepository
  ],
  controllers: [ExternalController, PayoutController, RechargeExternalController, SseController, PaymentGatewayController, ExternalPaymentGatewayController],
  exports: [
    MerchantClientService,
    CardsClientService,
    TransactionsClientService,
    ExternalService,
    PayoutService,
    RechargeClientService,
    PayoutClientService
  ],
})
export class IntegrationModule { }
