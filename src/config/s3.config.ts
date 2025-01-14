import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3ConfigService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    // 우선순위 1: .env에서 직접 가져오기
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.region = 'ap-northeast-2';

    if (!this.bucketName || this.bucketName.trim() === '') {
      throw new Error('[S3ConfigService] S3 Bucket Name이 .env에 설정되지 않았습니다.');
    }

    // region 값이 혹시 'function' 같은 문자열을 포함하는지 마지막으로 방어
    if (this.region.includes('function') || this.region.includes('=>')) {
      throw new Error(
        `[S3ConfigService] region 값이 이상합니다: ${this.region}. \n.env나 환경 변수를 다시 확인하세요.`,
      );
    }

    // AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY도 .env에서 가져오되
    // 값을 못 찾으면 Error나 원하는 처리
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('[S3ConfigService] AWS 자격 증명(accessKey, secretKey)이 설정되지 않았습니다.');
    }

    /// S3Client 생성
    this.s3Client = new S3Client({
      region: this.region, // 직접 하드코딩
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
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
