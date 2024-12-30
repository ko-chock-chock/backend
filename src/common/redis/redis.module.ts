// src/common/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // 전역 모듈 설정
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
