"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./controllers/auth.controller");
const auth_service_1 = require("./services/auth.service");
const jwt_1 = require("@nestjs/jwt");
const token_service_1 = require("./services/token.service");
const users_service_1 = require("../users/services/users.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../core/entities/user.entity");
const virtual_account_entity_1 = require("../core/entities/virtual-account.entity");
const transaction_money_entity_1 = require("../core/entities/transaction-money.entity");
const config_1 = require("@nestjs/config");
const refresh_token_entity_1 = require("../core/entities/refresh-token.entity");
const otp_info_entity_1 = require("../core/entities/otp-info.entity");
const otp_repository_1 = require("../notifications/repository/otp.repository");
const access_token_strategy_1 = require("./strategies/access-token.strategy");
const refresh_token_strategy_1 = require("./strategies/refresh-token.strategy");
const integration_module_1 = require("../integration/integration.module");
const wallet_service_1 = require("../wallet/services/wallet.service");
const wallet_entity_1 = require("../core/entities/wallet.entity");
const transactions_service_1 = require("../transactions/services/transactions.service");
const transactions_entity_1 = require("../core/entities/transactions.entity");
const pdf_module_1 = require("../pdf/pdf.module");
const order_entity_1 = require("../core/entities/order.entity");
const merchant_client_service_1 = require("../integration/busybox/external-system-client/merchant-client.service");
const axios_1 = require("@nestjs/axios");
const access_token_client_service_1 = require("../integration/busybox/external-system-client/access-token-client.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const cards_module_1 = require("../cards/cards.module");
const updaload_file_service_1 = require("../users/services/updaload-file.service");
const document_entity_1 = require("../core/entities/document.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const wallet_queue_1 = require("../wallet/services/wallet.queue");
const bull_1 = require("@nestjs/bull");
const coins_module_1 = require("../coins/coins.module");
const aadhar_verification_entity_1 = require("../core/entities/aadhar-verification.entity");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({ global: true }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, virtual_account_entity_1.VirtualAccount, transaction_money_entity_1.TransactionMoney, refresh_token_entity_1.RefreshToken, otp_info_entity_1.OtpInfo, wallet_entity_1.Wallet, transactions_entity_1.Transaction, order_entity_1.Order, document_entity_1.UserDocument, aadhar_verification_entity_1.AadharResponse]),
            pdf_module_1.PdfModule,
            cache_manager_1.CacheModule.register(),
            axios_1.HttpModule,
            integration_module_1.IntegrationModule,
            notifications_module_1.NotificationsModule,
            coins_module_1.CoinsModule,
            bull_1.BullModule.registerQueue({ name: 'wallet' }),
            cards_module_1.CardsModule
        ],
        providers: [
            auth_service_1.AuthService,
            token_service_1.TokenService,
            wallet_service_1.WalletService,
            wallet_queue_1.WalletBridge,
            transactions_service_1.TransactionsService,
            users_service_1.UsersService,
            updaload_file_service_1.UploadFileService,
            access_token_strategy_1.AccessTokenStrategy,
            access_token_client_service_1.AccessTokenClientService,
            merchant_client_service_1.MerchantClientService,
            refresh_token_strategy_1.RefreshTokenStrategy,
            config_1.ConfigService,
            otp_repository_1.OtpRepository,
        ],
        controllers: [auth_controller_1.AuthController],
        exports: [token_service_1.TokenService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map