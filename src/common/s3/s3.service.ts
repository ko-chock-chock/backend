import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3ConfigService } from '../../config/s3.config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly s3ConfigService: S3ConfigService) {
    this.s3Client = this.s3ConfigService.getS3Client();
    this.bucketName = this.s3ConfigService.getBucketName();

    // 디버깅 로그
    console.log('S3Service Initialized');
    console.log('S3 Bucket Name:', this.bucketName);
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${uuid()}-${file.originalname}`; // 고유한 파일 이름 생성

    console.log('Uploading file to S3:');
    console.log('File Name:', file.originalname);
    console.log('MIME Type:', file.mimetype);
    console.log('Buffer Size:', file.buffer ? file.buffer.length : 'undefined');

    if (!file.buffer) {
      throw new Error('File buffer is undefined.');
    }

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      console.log('Sending file to S3 with key:', key);
      await this.s3Client.send(new PutObjectCommand(params));
      const fileUrl = `https://${this.bucketName}.s3.${this.s3ConfigService.getS3Client().config.region}.amazonaws.com/${key}`;
      console.log('File successfully uploaded to S3:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new InternalServerErrorException('S3 upload failed');
    }
  }
}
