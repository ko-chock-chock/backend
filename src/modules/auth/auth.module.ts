import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from '../../common/redis/redis.service';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // 환경변수로 관리
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }, // 1시간 만료
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, RedisService],
  exports: [AuthService],
})
export class AuthModule {}
