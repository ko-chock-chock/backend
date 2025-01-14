import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3ConfigService } from '../../config/s3.config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3Client = this.s3ConfigService.getS3Client();
  private readonly bucketName = this.s3ConfigService.getBucketName();
  private readonly region = 'ap-northeast-2';

  constructor(private readonly s3ConfigService: S3ConfigService) {
    // 디버깅 로그
    console.log('[S3Service] Initialized:');
    console.log('  Bucket Name:', this.bucketName);
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('[S3Service] 업로드할 파일이 없습니다.');
    }

    console.log(
      '[S3Service] Files received for upload:',
      files.map((file) => file.originalname),
    );

    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // 파일명에 포함된 한글/특수문자 등을 '_'로 치환
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const key = `uploads/${Date.now()}-${uuid()}-${sanitizedFileName}`;

    console.log('[S3Service] Preparing to upload file:');
    console.log('  Original File Name:', file.originalname);
    console.log('  Sanitized Key:', key);

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      console.log('[S3Service] Uploading file to S3 with key:', key);

      await this.s3Client.send(new PutObjectCommand(params));

      // key가 URL에 안전하게 들어가도록 encodeURIComponent 적용
      const fileUrl = `https://${this.bucketName}.s3.ap-northeast-2.amazonaws.com/${encodeURIComponent(key)}`;

      console.log('[S3Service] File successfully uploaded. URL:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('[S3Service] S3 upload error:', error.message);
      throw new InternalServerErrorException('File upload failed');
    }
  }
}
