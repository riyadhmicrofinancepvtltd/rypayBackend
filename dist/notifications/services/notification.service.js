"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("../../core/entities/notification.entity");
const user_entity_1 = require("../../core/entities/user.entity");
const typeorm_2 = require("typeorm");
const pagination_response_dto_1 = require("../../transactions/dto/pagination-response.dto");
const recharge_notification_message_constant_1 = require("../constant/recharge-notification-message.constant");
const transaction_message_constant_1 = require("../constant/transaction-message.constant");
const firebase_client_service_1 = require("../../integration/firebase/firebase.client.service");
const transaction_type_enum_1 = require("../../transactions/enum/transaction-type.enum");
const referel_bonus_message_constant_1 = require("../constant/referel-bonus-message.constant");
const redeem_notification_constant_1 = require("../constant/redeem-notification.constant");
const new_user_registration_constant_1 = require("../constant/new-user-registration.constant");
const notification_title_map_constant_1 = require("../constant/notification-title-map.constant");
let NotificationService = class NotificationService {
    constructor(notificationRepository, userRepo, firebaseService) {
        this.notificationRepository = notificationRepository;
        this.userRepo = userRepo;
        this.firebaseService = firebaseService;
    }
    async insertInAppNotification(message, type, userId) {
        let user;
        if (userId) {
            user = await this.userRepo.findOne({ where: { id: userId } });
        }
        await this.sendPushNotificationToUser(user.mobileDevices, type, message?.replace(/<[^>]*>/g, ''), undefined);
        const notification = this.notificationRepository.create({ message, type, user });
        return this.notificationRepository.save(notification);
    }
    async sendPushNotificationToUser(tokens, type, message, icon) {
        const title = notification_title_map_constant_1.default.get(type) ?? type;
        if (tokens?.length) {
            await this.firebaseService.sendNotificationToMultipleTokens({
                tokens,
                icon,
                title,
                body: message
            });
        }
    }
    async processRechargeNotification(notificationData) {
        const message = (0, recharge_notification_message_constant_1.createRechargeMessage)({
            amount: notificationData.order.amount,
            rechargeNumber: notificationData.transaction.receiver,
            rechargeStatus: notificationData.transaction.status,
            rechargeType: notificationData.transaction.serviceUsed
        });
        const type = notificationData.transaction.status === "SUCCESS" ? notification_entity_1.NotificationType.RECHARGE_SUCCESS : notification_entity_1.NotificationType.RECHARGE_FAILED;
        await this.insertInAppNotification(message, type, notificationData.transaction.user.id);
    }
    async processTransactionNotification(notificationData) {
        const currentUser = notificationData.transaction.user;
        const message = (0, transaction_message_constant_1.createTransactionMessage)({
            amount: notificationData.transaction.amount,
            bankName: 'RYPAY',
            accountNumber: currentUser.phoneNumber,
            contact: notificationData.transaction.receiver,
            transactionType: notificationData.transaction.type
        });
        const type = notificationData.transaction.type === transaction_type_enum_1.TransactionType.CREDIT ? notification_entity_1.NotificationType.TRANSACTION_CREDIT : notification_entity_1.NotificationType.TRANSACTION_DEBIT;
        await this.insertInAppNotification(message, type, notificationData.transaction.user.id);
    }
    async processStaticQRNotification(notificationData) {
        const currentUser = notificationData.data.user;
        if (currentUser) {
            const message = (0, transaction_message_constant_1.createStaticQRMessage)(notificationData.data);
            const type = notification_entity_1.NotificationType.TRANSACTION_CREDIT;
            await this.insertInAppNotification(message, type, currentUser.id);
        }
    }
    async processReferrelNotification(notificationData) {
        const counterUserName = `${notificationData.counterPartyUser.firstName} ${notificationData.counterPartyUser.lastName}`;
        const message = (0, referel_bonus_message_constant_1.createReferrelMessage)(notificationData.isReferrer, notificationData.transaction.amount, counterUserName);
        const type = notification_entity_1.NotificationType.REFERREL_BONUS;
        await this.insertInAppNotification(message, type, notificationData.transaction.user.id);
    }
    async processCashbackRedemmedNotification(notificationData) {
        const message = (0, redeem_notification_constant_1.redeemNotifcation)(notificationData.data.coinAmount, notificationData.data.redemptionValue);
        const type = notification_entity_1.NotificationType.CASHBACK_REDEEMED;
        await this.insertInAppNotification(message, type, notificationData.data.user.id);
    }
    async processUserRegistrationNotification(notificationData) {
        const userName = `${notificationData.firstName} ${notificationData.lastName}`;
        const message = (0, new_user_registration_constant_1.newUserNotification)(userName);
        const type = notification_entity_1.NotificationType.NewUserRegistration;
        await this.insertInAppNotification(message, type, notificationData.id);
    }
    async processCashbackExpiryNotification(notificationData) {
        const message = (0, redeem_notification_constant_1.coinExpiredNotification)(notificationData.coinAmount);
        const type = notification_entity_1.NotificationType.RYCOIN_EXPIRED;
        await this.insertInAppNotification(message, type, notificationData.user.id);
    }
    async processAnnouncementNotification(notificationData) {
        const notification = this.notificationRepository.create({
            ...notificationData,
            user: null,
            isRead: true
        });
        const users = await this.userRepo.findBy({});
        const tokens = users.map((user => user.mobileDevices)).filter(token => !!token).flat(1);
        if (tokens?.length) {
            await this.firebaseService.sendNotificationToMultipleTokens({
                tokens,
                title: 'Announcement',
                body: notificationData.message?.replace(/<[^>]*>/g, ''),
                icon: undefined
            });
        }
        return this.notificationRepository.save(notification);
    }
    async findAllPaginated(userId, page, limit) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.ForbiddenException('user not found');
        }
        const userCreatedDate = user.createdAt;
        const [notifications, total] = await this.notificationRepository
            .createQueryBuilder('notification')
            .where('(notification.userId = :userId OR notification.userId IS NULL)', { userId })
            .andWhere('notification.createdAt >= :userCreatedDate', { userCreatedDate })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('notification.createdAt', 'DESC')
            .getManyAndCount();
        const pagination = new pagination_response_dto_1.Pagination();
        return pagination.PaginateResponse(notifications, total, page, limit);
    }
    async getNotificationList(userId, page, limit) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.ForbiddenException('user not found');
        }
        const userCreatedDate = user.createdAt;
        const [notifications, totalItems] = await this.notificationRepository
            .createQueryBuilder('notification')
            .where('(notification.userId = :userId OR notification.userId IS NULL)', { userId })
            .andWhere('notification.createdAt >= :userCreatedDate', { userCreatedDate })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('notification.createdAt', 'DESC')
            .getManyAndCount();
        const totalPages = Math.ceil(totalItems / limit);
        return {
            success: true,
            message: "Fetched notifications successfully",
            notifications,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit,
            },
        };
    }
    async markAllRead(userId) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.ForbiddenException('User does not have enough permissions');
        }
        await this.notificationRepository.update({}, { isRead: true });
        return true;
    }
    async markAsRead(notificationId) {
        const notification = await this.notificationRepository.findOne({ where: { id: notificationId } });
        notification.isRead = true;
        return this.notificationRepository.save(notification);
    }
    async deleteOldNotifications() {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        await this.notificationRepository.delete({
            createdAt: (0, typeorm_2.LessThan)(fourteenDaysAgo)
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        firebase_client_service_1.FirebaseClientService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map