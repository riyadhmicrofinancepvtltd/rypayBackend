import { Request, Response } from 'express';
import { Queue } from 'bull';
export declare class DashboardController {
    private receiptsQueue;
    private readonly serverAdapter;
    constructor(receiptsQueue: Queue);
    serve(req: Request, res: Response): void;
}
