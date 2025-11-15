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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("@bull-board/api");
const bullAdapter_1 = require("@bull-board/api/bullAdapter");
const express_1 = require("@bull-board/express");
const bull_1 = require("@nestjs/bull");
const session = require("express-session");
let DashboardController = class DashboardController {
    constructor(receiptsQueue) {
        this.receiptsQueue = receiptsQueue;
        this.serverAdapter = new express_1.ExpressAdapter();
        this.serverAdapter.setBasePath('/admin/queues');
        (0, api_1.createBullBoard)({
            queues: [new bullAdapter_1.BullAdapter(this.receiptsQueue)],
            serverAdapter: this.serverAdapter,
        });
    }
    serve(req, res) {
        req.app.use(session({
            secret: 'bull-board-secret-2025',
            resave: false,
            saveUninitialized: false,
        }));
        this.serverAdapter.getRouter()(req, res);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "serve", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('admin/queues'),
    __param(0, (0, bull_1.InjectQueue)('payment-receipts')),
    __metadata("design:paramtypes", [Object])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map