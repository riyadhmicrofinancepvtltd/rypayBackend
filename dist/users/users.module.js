"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./controllers/user.controller");
const users_service_1 = require("./services/users.service");
const auth_module_1 = require("../auth/auth.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../core/entities/user.entity");
const virtual_account_entity_1 = require("../core/entities/virtual-account.entity");
const transactions_entity_1 = require("../core/entities/transactions.entity");
const transaction_money_entity_1 = require("../core/entities/transaction-money.entity");
const wallet_entity_1 = require("../core/entities/wallet.entity");
const integration_module_1 = require("../integration/integration.module");
const config_1 = require("@nestjs/config");
const wallet_module_1 = require("../wallet/wallet.module");
const updaload_file_service_1 = require("./services/updaload-file.service");
const document_entity_1 = require("../core/entities/document.entity");
const config_2 = require("@nestjs/config");
const cards_module_1 = require("../cards/cards.module");
const otp_flow_service_1 = require("../notifications/services/otp-flow.service");
const sms_client_service_1 = require("../notifications/sms-client.service");
const mail_service_1 = require("../notifications/services/mail.service");
const otp_repository_1 = require("../notifications/repository/otp.repository");
const axios_1 = require("@nestjs/axios");
const otp_info_entity_1 = require("../core/entities/otp-info.entity");
const aadhar_verification_entity_1 = require("../core/entities/aadhar-verification.entity");
const bull_1 = require("@nestjs/bull");
const notification_bridge_1 = require("../notifications/services/notification-bridge");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule,
            bull_1.BullModule.registerQueue({ name: 'notification' }),
            axios_1.HttpModule, integration_module_1.IntegrationModule, cards_module_1.CardsModule, wallet_module_1.WalletModule, config_1.ConfigModule, (0, common_1.forwardRef)(() => wallet_module_1.WalletModule), typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, transactions_entity_1.Transaction, transaction_money_entity_1.TransactionMoney, virtual_account_entity_1.VirtualAccount, wallet_entity_1.Wallet, document_entity_1.UserDocument, otp_info_entity_1.OtpInfo, aadhar_verification_entity_1.AadharResponse])],
        providers: [users_service_1.UsersService, config_2.ConfigService, notification_bridge_1.NotificationBridge, updaload_file_service_1.UploadFileService, otp_flow_service_1.OtpFlowService, sms_client_service_1.SmsClientService, mail_service_1.MailService, otp_repository_1.OtpRepository],
        controllers: [user_controller_1.UsersController],
        exports: [users_service_1.UsersService, updaload_file_service_1.UploadFileService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map