import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3ConfigService } from '../../config/s3.config';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

  /**
   * 여러 파일 업로드
   * @param files Express.Multer.File[]
   * @returns Promise<string[]> 업로드된 파일 URL 배열
   */
  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('[S3Service] 업로드할 파일이 없습니다.');
    }

    console.log(
      '[S3Service] Files received for upload:',
      files.map((file) => file.originalname),
    );

    // 파일 업로드 병렬 처리
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * 단일 파일 업로드
   * @param file Express.Multer.File
   * @returns Promise<string> 업로드된 파일 URL
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // 파일명 정리 (한글/특수문자 제거 및 UUID 추가)
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

      // URL 생성 (key를 안전하게 인코딩)
      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${encodeURIComponent(key)}`;

      console.log('[S3Service] File successfully uploaded. URL:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('[S3Service] S3 upload error:', error.message);
      throw new InternalServerErrorException('파일 업로드 중 문제가 발생했습니다.');
    }
  }

  /**
   * 단일 파일 삭제
   * @param fileKey string S3에 저장된 파일의 키
   * @returns Promise<void>
   */
  async deleteFile(fileKey: string): Promise<void> {
    console.log('[S3Service] Preparing to delete file with key:', fileKey);

    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
      console.log('[S3Service] File successfully deleted:', fileKey);
    } catch (error) {
      console.error('[S3Service] S3 delete error:', error.message);
      throw new InternalServerErrorException('파일 삭제 중 문제가 발생했습니다.');
    }
  }
}
