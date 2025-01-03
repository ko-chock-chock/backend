import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './common/redis/redis.module';
import { UserModule } from './modules/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { BoardsModule } from './modules/boards/boards.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    BoardsModule,
    RedisModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql_container',
      port: 3306,
      username: 'root',
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService, // JWT 서비스 제공
    {
      provide: APP_GUARD, // 글로벌 가드로 JwtAuthGuard 설정
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized!');
  }
}
