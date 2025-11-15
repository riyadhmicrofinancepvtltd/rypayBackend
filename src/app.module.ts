import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { IntegrationModule } from './integration/integration.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { WalletModule } from './wallet/wallet.module';
import { CardsModule } from './cards/cards.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PdfModule } from './pdf/pdf.module';
import { RechargeModule } from './recharge/recharge.module';
import { BeneficiaryModule } from './beneficiary/beneficiary.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { LoansModule } from './loans/loans.module';
import { MoneyRequestModule } from './money-request/money-request.module';
import { CoinsModule } from './coins/coins.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    CoreModule,
    QueueModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/assets/',
      exclude: ['/api/(.*)'],
    },
    {
      rootPath: join(__dirname, '..', 'public/.well-known'),
      serveRoot: '/.well-known',
    }
  ),
    BullModule.forRoot({
      redis: {
        port: 6379,
        host: 'localhost'
      }
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          level: 'trace',
          targets: [{
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              levelFirst: false,
              translateTime: "yyyy-MM-dd'T'HH:mm:ss.l'Z'",
              messageFormat: '{req.headers.x-correlation-id} [{context}] {msg}',
              ignore: 'pid,hostname,res,context,req',
              errorLikeObjectKeys: ['err', 'error'],
            },
          },
          {
            target: 'pino/file',
            level: 'error',
            options: {
              destination: './logs/app-error.log',
              mkdir: true,
            },
          },
        ] 
        }
      },
    }),
    ConfigModule.forRoot(),
    AuthModule,
    IntegrationModule,
    UsersModule,
    NotificationsModule,
    WalletModule,
    CardsModule,
    TransactionsModule,
    PdfModule,
    RechargeModule,
    BeneficiaryModule,
    LoansModule,
    MoneyRequestModule,
    CoinsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
