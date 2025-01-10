import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3ConfigService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.region = this.configService.get<string>('AWS_REGION');

    if (!this.bucketName) {
      throw new Error('S3 Bucket Name is not defined in environment variables.');
    }

    if (!this.region) {
      throw new Error('AWS Region is not defined in environment variables.');
    }

    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.region,
    });

    // 디버깅 로그
    console.log('[S3ConfigService] Initialized:');
    console.log('  Bucket Name:', this.bucketName);
    console.log('  Region:', this.region);
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  getBucketName(): string {
    return this.bucketName;
  }

  getRegion(): string {
    return this.region;
  }
}
