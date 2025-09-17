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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("../services/notification.service");
const announcement_notification_dto_1 = require("../dto/announcement-notification.dto");
const notification_entity_1 = require("../../core/entities/notification.entity");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async postAnnouncements(body) {
        await this.notificationService.processAnnouncementNotification({
            message: body.message,
            type: notification_entity_1.NotificationType.ANNOUNCEMENT
        });
        return {
            message: "Success"
        };
    }
    async markNotificationRead(notificationId) {
        await this.notificationService.markAsRead(notificationId);
        return {
            message: "Success"
        };
    }
    async markAllNotificationRead(req) {
        await this.notificationService.markAllRead(req.res.sub);
        return {
            message: "Success"
        };
    }
    async listNotifcation(page = 1, limit = 10, req) {
        return this.notificationService.findAllPaginated(req.user.sub, page, limit);
    }
    async getNotificationList(page = 1, limit = 10, req) {
        return this.notificationService.getNotificationList(req.user.sub, page, limit);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('/announcement'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Sends Announcement to every user, allowed for admin only' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcement_notification_dto_1.AnnouncementNotification]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "postAnnouncements", null);
__decorate([
    (0, common_1.Put)('/read'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mark Notification as Read' }),
    __param(0, (0, common_1.Query)('notificationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markNotificationRead", null);
__decorate([
    (0, common_1.Post)('/read/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mark Notification as Read' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllNotificationRead", null);
__decorate([
    (0, common_1.Post)('list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'get notifications' }),
    __param(0, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "listNotifcation", null);
__decorate([
    (0, common_1.Post)('list-new'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'get notifications' }),
    __param(0, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationList", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map