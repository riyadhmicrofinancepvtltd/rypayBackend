import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as QRCode from 'qrcode';


@Injectable()
export class UploadFileService {
  private client: S3Client;
  private bucketName: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get('S3_BUCKET_NAME');
    const s3_region = this.configService.get('S3_BUCKET_REGION');
    if (!s3_region) {
      throw new Error('S3_REGION not found or set');
    }
    this.client = new S3Client({
      region: s3_region,
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
    console.log('S3 Client initialized for bucket:', { accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),"region":s3_region });
  }
  async uploadSingleFile(file: Express.Multer.File) {
    try {
      const key = `${uuidv4()}`;
      const command = new PutObjectCommand({
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
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // async generateAndUploadUpiQR(upi: string): Promise<{ key: string; url: string }> {
  //   try {
  //     // 1️⃣ Generate QR code buffer
  //           console.log("QR BUFFjdjdER" )

  //     const qrBuffer = await QRCode.toBuffer(upi);
  //     console.log("QR BUFFER", qrBuffer.length)
  //     // 2️⃣ Upload to S3 (same as your uploadSingleFile)
  //     const key = `${uuidv4()}.png`;
  //     const command = new PutObjectCommand({
  //       Bucket: this.bucketName,
  //       Key: key,
  //       Body: qrBuffer,
  //       ContentType: 'image/png',
  //       ACL: 'private',
  //     });
  //     await this.client.send(command);

  //     // 3️⃣ Get presigned URL
  //     const url = (await this.getPresignedSignedUrl(key)).url;

  //     return { key, url };
  //   } catch (err) {
  //     console.log("ERROR IN QR CODE GENERATION", err);
  //     throw new InternalServerErrorException('Failed to generate or upload QR code');
  //   }

  // }
async generateAndUploadUpiQR(upi: string): Promise<{ key: string; url: string }> {
    try {
      console.log("[QR] Generating QR code for UPI:", upi);

      // 1️⃣ Generate QR code buffer
      const qrBuffer = await QRCode.toBuffer(upi);
      console.log("[QR] Buffer generated, size:", qrBuffer.length);

      // 2️⃣ Upload to S3
      // const key = `upi-qr/${uuidv4()}.png`;
      const key = `${uuidv4()}.png`;

      console.log("[S3] Uploading to bucket:", this.bucketName, "key:", key);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: qrBuffer,
        ContentType: 'image/png',
        ACL: 'private',
      });

      await this.client.send(command);
      console.log("[S3] Upload successful for key:", key);

      // 3️⃣ Get presigned URL
      const { url } = await this.getPresignedSignedUrl(key);
      console.log("[QR] Presigned URL generated");

      return { key, url };
    } catch (err) {
      console.error('[QR] ERROR:', {
        message: err.message,
        code: err.code,
        statusCode: err.$metadata?.httpStatusCode,
      });
      throw new InternalServerErrorException(`Failed to generate QR: ${err.message}`);
    }
  }
  async getPresignedSignedUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 48 * 60 * 60, // 2 days
      });
      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
