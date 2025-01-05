import { Module } from '@nestjs/common';
import { S3ConfigService } from '../../config/s3.config';
import { S3Service } from './s3.service';

@Module({
  providers: [S3ConfigService, S3Service],
  exports: [S3Service], // S3Service를 외부에서 사용할 수 있도록 내보냄
})
export class S3Module {}
