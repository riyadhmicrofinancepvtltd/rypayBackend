// queue/dashboard.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
// import { BullAdapter } from '@bull-board/api/dist/adapters/bullAdapter'; // ← FIXED PATH
import { ExpressAdapter } from '@bull-board/express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as session from 'express-session';
// import { ExpressAdapter } from '@nestjs/platform-express';

@Controller('admin/queues')
export class DashboardController {
  private readonly serverAdapter = new ExpressAdapter();

  constructor(@InjectQueue('payment-receipts') private receiptsQueue: Queue) {
    this.serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [new BullAdapter(this.receiptsQueue)],
      serverAdapter: this.serverAdapter,
    });
  }

  @Get()
  // @UseGuards(AuthGuard('basic'))
  public serve(@Req() req: Request, @Res() res: Response) {
    req.app.use(
      session({
        secret: 'bull-board-secret-2025',
        resave: false,
        saveUninitialized: false,
      }),
    );

    this.serverAdapter.getRouter()(req, res);
  }
}