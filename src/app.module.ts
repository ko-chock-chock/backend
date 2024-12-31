import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './common/redis/redis.module';
import { UserModule } from './modules/users/users.module';
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
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized!');
  }
}
