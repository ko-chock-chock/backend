import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3ConfigService } from '../../config/s3.config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  constructor(private readonly s3ConfigService: S3ConfigService) {
    this.s3 = this.s3ConfigService.getS3Instance();
    this.bucketName = this.s3ConfigService.getBucketName();
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${uuid()}-${file.originalname}`; // 고유한 파일 이름 생성

    console.log('S3 Bucket Name:', this.bucketName);
    console.log('Uploading file to S3:', file.originalname, file.buffer); // 디버깅 로그

    if (!file.buffer) {
      throw new Error('File buffer is undefined.');
    }

    try {
      const result = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer, // 이 부분 확인
          ContentType: file.mimetype, // 파일 MIME 타입 설정
        })
        .promise();

      return result.Location;
    } catch (error) {
      console.error('S3 업로드 오류:', error.message);
      throw new InternalServerErrorException('S3 업로드 실패');
    }
  }
}
