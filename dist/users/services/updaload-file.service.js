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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const QRCode = require("qrcode");
let UploadFileService = class UploadFileService {
    constructor(configService) {
        this.configService = configService;
        this.bucketName = this.configService.get('S3_BUCKET_NAME');
        const s3_region = this.configService.get('S3_BUCKET_REGION');
        if (!s3_region) {
            throw new Error('S3_REGION not found or set');
        }
        this.client = new client_s3_1.S3Client({
            region: s3_region,
            credentials: {
                accessKeyId: this.configService.get('S3_ACCESS_KEY'),
                secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
            },
            forcePathStyle: true,
        });
    }
    async uploadSingleFile(file) {
        try {
            const key = `${(0, uuid_1.v4)()}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'private',
                Metadata: {
                    originalName: file.originalname,
                },
            });
            await this.client.send(command);
            return {
                url: (await this.getPresignedSignedUrl(key)).url,
                key
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async generateAndUploadUpiQR(upi) {
        const qrBuffer = await QRCode.toBuffer(upi);
        const key = `${(0, uuid_1.v4)()}.png`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: qrBuffer,
            ContentType: 'image/png',
            ACL: 'private',
        });
        await this.client.send(command);
        const url = (await this.getPresignedSignedUrl(key)).url;
        return { key, url };
    }
    async getPresignedSignedUrl(key) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
                expiresIn: 48 * 60 * 60,
            });
            return { url };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error);
        }
    }
};
exports.UploadFileService = UploadFileService;
exports.UploadFileService = UploadFileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadFileService);
//# sourceMappingURL=updaload-file.service.js.map