import { Notification, NotificationType } from 'src/core/entities/notification.entity';
import { User } from 'src/core/entities/user.entity';
import { Repository } from 'typeorm';
import { RechargeNotificationDto } from '../dto/recharge-notification.dto';
import { CashbackRedemmedNotification, ReferrelNotification, StaticQRNotification, TransactionNotification } from '../dto/transaction-notification.dto';
import { GeneralNotification } from '../dto/announcement-notification.dto';
import { FirebaseClientService } from 'src/integration/firebase/firebase.client.service';
import { CoinTransaction } from 'src/core/entities/coins.entity';
export declare class NotificationService {
    private notificationRepository;
    private userRepo;
    private firebaseService;
    constructor(notificationRepository: Repository<Notification>, userRepo: Repository<User>, firebaseService: FirebaseClientService);
    insertInAppNotification(message: string, type: NotificationType, userId?: string): Promise<Notification>;
    sendPushNotificationToUser(tokens: string[], type: NotificationType, message: string, icon: string): Promise<void>;
    processRechargeNotification(notificationData: RechargeNotificationDto): Promise<void>;
    processTransactionNotification(notificationData: TransactionNotification): Promise<void>;
    processStaticQRNotification(notificationData: StaticQRNotification): Promise<void>;
    processReferrelNotification(notificationData: ReferrelNotification): Promise<void>;
    processCashbackRedemmedNotification(notificationData: CashbackRedemmedNotification): Promise<void>;
    processUserRegistrationNotification(notificationData: User): Promise<void>;
    processCashbackExpiryNotification(notificationData: CoinTransaction): Promise<void>;
    processAnnouncementNotification(notificationData: GeneralNotification): Promise<Notification>;
    findAllPaginated(userId: string, page: number, limit: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            pageSize: number;
            totalRecords: number;
            pageCount: number;
            hasPreviousPage: boolean;
            hasNextPage: boolean;
        };
    }>;
    getNotificationList(userId: string, page: number, limit: number): Promise<any>;
    markAllRead(userId: string): Promise<boolean>;
    markAsRead(notificationId: number): Promise<Notification>;
    deleteOldNotifications(): Promise<void>;
}
