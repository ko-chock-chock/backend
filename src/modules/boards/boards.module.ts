import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { BoardImage } from './entities/board-image.entity';
import { S3Module } from '../../common/s3/s3.module';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardImage]), // Board 및 BoardImage 엔티티를 TypeORM에 등록
    S3Module, // AWS S3 모듈 추가
    MulterModule.register({
      dest: './uploads', // 파일 저장 경로
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ko_chock_chock_jwt', // 환경변수로 관리
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }, // 1시간 만료
    }),
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService, JwtModule],
})
export class BoardsModule {}
