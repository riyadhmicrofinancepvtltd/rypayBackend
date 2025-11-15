"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const core_module_1 = require("./core/core.module");
const integration_module_1 = require("./integration/integration.module");
const notifications_module_1 = require("./notifications/notifications.module");
const users_module_1 = require("./users/users.module");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const wallet_module_1 = require("./wallet/wallet.module");
const cards_module_1 = require("./cards/cards.module");
const transactions_module_1 = require("./transactions/transactions.module");
const pdf_module_1 = require("./pdf/pdf.module");
const recharge_module_1 = require("./recharge/recharge.module");
const beneficiary_module_1 = require("./beneficiary/beneficiary.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const bull_1 = require("@nestjs/bull");
const loans_module_1 = require("./loans/loans.module");
const money_request_module_1 = require("./money-request/money-request.module");
const coins_module_1 = require("./coins/coins.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const queue_module_1 = require("./queue/queue.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_module_1.CoreModule,
            queue_module_1.QueueModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'assets'),
                serveRoot: '/assets/',
                exclude: ['/api/(.*)'],
            }, {
                rootPath: (0, path_1.join)(__dirname, '..', 'public/.well-known'),
                serveRoot: '/.well-known',
            }),
            bull_1.BullModule.forRoot({
                redis: {
                    port: 6379,
                    host: 'localhost'
                }
            }),
            nestjs_pino_1.LoggerModule.forRoot({
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
            config_1.ConfigModule.forRoot(),
            auth_module_1.AuthModule,
            integration_module_1.IntegrationModule,
            users_module_1.UsersModule,
            notifications_module_1.NotificationsModule,
            wallet_module_1.WalletModule,
            cards_module_1.CardsModule,
            transactions_module_1.TransactionsModule,
            pdf_module_1.PdfModule,
            recharge_module_1.RechargeModule,
            beneficiary_module_1.BeneficiaryModule,
            loans_module_1.LoansModule,
            money_request_module_1.MoneyRequestModule,
            coins_module_1.CoinsModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map