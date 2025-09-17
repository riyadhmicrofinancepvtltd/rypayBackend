import { NotificationService } from '../services/notification.service';
import { AnnouncementNotification } from '../dto/announcement-notification.dto';
import { PaginatedResponseDto } from 'src/transactions/dto/pagination-response.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    postAnnouncements(body: AnnouncementNotification): Promise<{
        message: string;
    }>;
    markNotificationRead(notificationId: number): Promise<{
        message: string;
    }>;
    markAllNotificationRead(req: any): Promise<{
        message: string;
    }>;
    listNotifcation(page: number, limit: number, req: any): Promise<PaginatedResponseDto<Notification>>;
    getNotificationList(page: number, limit: number, req: any): Promise<PaginatedResponseDto<Notification>>;
}
