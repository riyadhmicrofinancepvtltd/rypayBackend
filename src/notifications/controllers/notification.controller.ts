import { Body, Controller, Get, ParseIntPipe, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { NotificationService } from '../services/notification.service';
import { AnnouncementNotification } from '../dto/announcement-notification.dto';
import { NotificationType } from 'src/core/entities/notification.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedResponseDto } from 'src/transactions/dto/pagination-response.dto';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService
  ) {}

  @Post('/announcement')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Sends Announcement to every user, allowed for admin only' })
  async postAnnouncements(@Body() body: AnnouncementNotification) {
    await this.notificationService.processAnnouncementNotification({
      message: body.message,
      type: NotificationType.ANNOUNCEMENT
    });
    return {
      message: "Success"
    }
  }

  @Put('/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark Notification as Read' })
  async markNotificationRead(@Query('notificationId', ParseIntPipe) notificationId: number,) {
    await this.notificationService.markAsRead(notificationId);
    return {
      message: "Success"
    }
  }

  @Post('/read/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark Notification as Read' })
  async markAllNotificationRead(@Req() req: any) {
    await this.notificationService.markAllRead(req.res.sub);
    return {
      message: "Success"
    }
  }

  @Post('list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'get notifications' })
  async listNotifcation(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Req() req: any
  ): Promise<PaginatedResponseDto<Notification>> {
    return this.notificationService.findAllPaginated(req.user.sub, page, limit);
  }

  @Post('list-new')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'get notifications' })
  async getNotificationList(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Req() req: any
  ): Promise<PaginatedResponseDto<Notification>> {
    return this.notificationService.getNotificationList(req.user.sub, page, limit);
  }
}