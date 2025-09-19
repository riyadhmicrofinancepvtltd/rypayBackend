"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationModule = void 0;
const axios_1 = require("@nestjs/axios");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_redis_store_1 = require("cache-manager-redis-store");
const cards_service_1 = require("../cards/services/cards.service");
const busybox_webhook_logs_entity_1 = require("../core/entities/busybox_webhook_logs.entity");
const card_entity_1 = require("../core/entities/card.entity");
const document_entity_1 = require("../core/entities/document.entity");
const order_entity_1 = require("../core/entities/order.entity");
const otp_info_entity_1 = require("../core/entities/otp-info.entity");
const transactions_entity_1 = require("../core/entities/transactions.entity");
const user_entity_1 = require("../core/entities/user.entity");
const virtual_account_entity_1 = require("../core/entities/virtual-account.entity");
const rewards_entity_1 = require("../core/entities/rewards.entity");
const transaction_money_entity_1 = require("../core/entities/transaction-money.entity");
const wallet_entity_1 = require("../core/entities/wallet.entity");
const webhook_entity_1 = require("../core/entities/webhook.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const otp_repository_1 = require("../notifications/repository/otp.repository");
const mail_service_1 = require("../notifications/services/mail.service");
const otp_flow_service_1 = require("../notifications/services/otp-flow.service");
const sms_client_service_1 = require("../notifications/sms-client.service");
const pdf_service_1 = require("../pdf/services/pdf.service");
const transactions_service_1 = require("../transactions/services/transactions.service");
const updaload_file_service_1 = require("../users/services/updaload-file.service");
const users_service_1 = require("../users/services/users.service");
const wallet_queue_1 = require("../wallet/services/wallet.queue");
const wallet_service_1 = require("../wallet/services/wallet.service");
const recharge_client_service_1 = require("./a1topup/external-system-client/recharge/recharge-client.service");
const recharge_external_controller_1 = require("./a1topup/external/controllers/recharge-external.controller");
const access_token_client_service_1 = require("./busybox/external-system-client/access-token-client.service");
const cards_client_service_1 = require("./busybox/external-system-client/cards-client.service");
const merchant_client_service_1 = require("./busybox/external-system-client/merchant-client.service");
const payout_client_service_1 = require("./busybox/external-system-client/payout-client.service");
const transactions_client_service_1 = require("./busybox/external-system-client/transactions-client.service");
const external_controller_1 = require("./busybox/external/controllers/external.controller");
const payout_controller_1 = require("./busybox/external/controllers/payout.controller");
const recharge_sse_controller_1 = require("./busybox/external/controllers/recharge-sse.controller");
const external_service_1 = require("./busybox/external/services/external.service");
const payout_service_1 = require("./busybox/external/services/payout.service");
const sse_service_1 = require("./busybox/external/services/sse-service");
const bull_1 = require("@nestjs/bull");
const coins_module_1 = require("../coins/coins.module");
const aadhar_verification_entity_1 = require("../core/entities/aadhar-verification.entity");
const upitransact_external_controller_1 = require("./upitransact/external/controllers/upitransact-external.controller");
const upitransact_controller_1 = require("./upitransact/external/controllers/upitransact.controller");
const payment_external_service_1 = require("./upitransact/external/services/payment-external.service");
const payment_external_client_service_1 = require("./upitransact/external-system-client/payment-external-client.service");
let IntegrationModule = class IntegrationModule {
};
exports.IntegrationModule = IntegrationModule;
exports.IntegrationModule = IntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.register({
                store: cache_manager_redis_store_1.redisStore,
                host: 'localhost',
                port: 6379
            }),
            bull_1.BullModule.registerQueue({ name: 'wallet' }),
            axios_1.HttpModule, config_1.ConfigModule,
            notifications_module_1.NotificationsModule,
            coins_module_1.CoinsModule,
            typeorm_1.TypeOrmModule.forFeature([wallet_entity_1.Wallet, user_entity_1.User, virtual_account_entity_1.VirtualAccount, rewards_entity_1.Reward, transaction_money_entity_1.TransactionMoney, order_entity_1.Order, transactions_entity_1.Transaction, card_entity_1.Card, busybox_webhook_logs_entity_1.BusyBoxWebhookResponse, webhook_entity_1.WebhookResponse, document_entity_1.UserDocument, otp_info_entity_1.OtpInfo, aadhar_verification_entity_1.AadharResponse])
        ],
        providers: [
            merchant_client_service_1.MerchantClientService,
            cards_client_service_1.CardsClientService,
            wallet_service_1.WalletService,
            pdf_service_1.PdfService,
            users_service_1.UsersService,
            updaload_file_service_1.UploadFileService,
            cards_service_1.CardsService,
            transactions_service_1.TransactionsService,
            access_token_client_service_1.AccessTokenClientService,
            transactions_client_service_1.TransactionsClientService,
            external_service_1.ExternalService,
            payment_external_client_service_1.PaymentExternalClientService,
            payment_external_service_1.PaymentExternalService,
            sse_service_1.SseService,
            recharge_client_service_1.RechargeClientService,
            payout_client_service_1.PayoutClientService,
            payout_service_1.PayoutService,
            otp_flow_service_1.OtpFlowService,
            sms_client_service_1.SmsClientService,
            mail_service_1.MailService,
            wallet_queue_1.WalletBridge,
            otp_repository_1.OtpRepository
        ],
        controllers: [external_controller_1.ExternalController, payout_controller_1.PayoutController, recharge_external_controller_1.RechargeExternalController, recharge_sse_controller_1.SseController, upitransact_controller_1.PaymentGatewayController, upitransact_external_controller_1.ExternalPaymentGatewayController],
        exports: [
            merchant_client_service_1.MerchantClientService,
            cards_client_service_1.CardsClientService,
            transactions_client_service_1.TransactionsClientService,
            external_service_1.ExternalService,
            payout_service_1.PayoutService,
            recharge_client_service_1.RechargeClientService,
            payout_client_service_1.PayoutClientService
        ],
    })
], IntegrationModule);
//# sourceMappingURL=integration.module.js.map