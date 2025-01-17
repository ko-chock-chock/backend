import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access Token이 제공되지 않았습니다.');
    }

    try {
      const payload = this.jwtService.verify(token, { secret: 'ko_chock_chock_jwt' });
      console.log('Decoded JWT Payload:', payload); // 확인

      const redisKey = `access_token:${payload.sub}`; // payload.sub 확인
      const storedToken = await this.redisService.get(redisKey);

      console.log('Redis Key:', redisKey);
      console.log('Stored Token:', storedToken);

      if (!storedToken || storedToken !== token) {
        throw new UnauthorizedException('유효하지 않은 Access Token입니다.');
      }

      // 여기서 request.user에 user_id 필드 추가
      request.user = {
        user_id: payload.sub, // sub를 user_id로 매핑
      };

      console.log('Request User:', request.user); // 확인
    } catch (error) {
      console.error('JWT Verification or Redis Error:', error.message);
      throw new UnauthorizedException('유효하지 않은 Access Token입니다.');
    }

    console.log('JWT Auth Guard: Authentication Successful');
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Invalid Authorization Header:', authHeader);
      throw new HttpException('Access Token이 제공되지 않았습니다.', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Extracted Token:', token);
    return token;
  }
}
