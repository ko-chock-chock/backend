import * as AWS from 'aws-sdk';

export class S3ConfigService {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  constructor() {
    // 환경 변수에서 S3 설정 로드
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!this.bucketName) {
      throw new Error('S3 Bucket Name is not defined in environment variables.');
    }
  }

  // S3 인스턴스를 반환
  getS3Instance(): AWS.S3 {
    return this.s3;
  }

  // S3 Bucket 이름 반환
  getBucketName(): string {
    return this.bucketName;
  }
}
