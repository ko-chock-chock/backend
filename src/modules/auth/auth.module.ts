import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from '../../common/redis/redis.service';
import { UserModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/guards/jwt.strategy';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 ConfigService 사용 가능
    }),
    UserModule,
    PassportModule, // Passport 인증 모듈
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'ko_chock_chock_jwt'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard, AuthService, UserService, RedisService],
  exports: [AuthService, JwtAuthGuard, PassportModule],
})
export class AuthModule {}
