"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : exception?.message || 'Internal server error';
        this.logger.error(`Error on ${request.method} ${request.url}: ${JSON.stringify(message)}`, exception?.stack);
        const openUrls = [
            "/user/set-app-lock-pin",
            "/user/new-signup",
            "/user/verify-aadhaar-otp",
            "/user",
            "/auth/validate-otp-new",
            "/user/verify-app-lock-pin",
            "/user/change-app-lock-pin",
            "/user/verify-app-lock-pin-otp",
            "/user/change-transaction-pin",
            "/user/verify-transaction-pin-otp",
            "/user/delete-user",
            "/user/verify-to-contact"
        ];
        if (openUrls.includes(request.url)) {
            response.status(status).json({
                statusCode: status,
                success: false,
                message: message.message[0],
            });
        }
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exception-filters.js.map