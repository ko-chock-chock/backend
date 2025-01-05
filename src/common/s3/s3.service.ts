import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME; // 환경 변수에서 버킷 이름 읽기

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // 환경 변수에서 Access Key 읽기
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // 환경 변수에서 Secret Key 읽기
      region: process.env.AWS_REGION, // 환경 변수에서 AWS 리전 읽기
    });
  }

  // 파일 업로드 처리
  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  // 개별 파일 업로드
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${uuid()}-${file.originalname}`; // 고유한 파일 이름 생성

    try {
      const result = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer, // 파일 데이터를 읽음
          ContentType: file.mimetype, // 파일 MIME 타입 설정
        })
        .promise();

      return result.Location; // 업로드된 파일의 URL 반환
    } catch (error) {
      console.error('S3 파일 업로드 오류:', error);
      throw new InternalServerErrorException('파일 업로드에 실패했습니다.');
    }
  }
}
