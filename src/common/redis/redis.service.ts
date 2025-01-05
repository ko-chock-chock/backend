import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'redis_container',
      port: 6379,
      password: process.env.REDIS_PASSWORD || '',
    });
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    console.log('Redis Set Key:', key);
    console.log('Redis Set Value:', value);
    if (expireSeconds) {
      console.log('Redis Expiry Time:', expireSeconds);
      await this.redis.set(key, value, 'EX', expireSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    console.log('Redis Get Key:', key);
    const value = await this.redis.get(key);
    console.log('Redis Get Value:', value);
    return value;
  }
}
