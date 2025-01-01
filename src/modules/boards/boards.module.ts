import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board])], // Board 엔터티를 TypeORM에 등록
  controllers: [BoardsController], // 컨트롤러 등록
  providers: [BoardsService], // 서비스 등록
  exports: [BoardsService],
})
export class BoardsModule {}
