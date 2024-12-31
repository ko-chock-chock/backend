import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';

@Controller('api/v1/boards') // API 기본 경로 설정
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // 게시글 생성
  @Post('newBoard')
  async createBoard(@Body() body: Partial<Board>) {
    const newBoard = await this.boardsService.createBoard(body);
    return { message: '게시글이 생성되었습니다.', data: newBoard };
  }

  // 게시글 리스트 조회
  @Get()
  async getAllBoards() {
    const boards = await this.boardsService.getAllBoards();
    return { message: '게시글 목록 조회 성공', data: boards };
  }

  // 특정 게시글 조회
  @Get(':boardId')
  async getBoardById(@Param('boardId') board_id: number) {
    const board = await this.boardsService.getBoardById(board_id);
    return { message: '게시글 조회 성공', data: board };
  }

  // 게시글 수정
  @Patch(':boardId/edit')
  async updateBoard(@Param('boardId') board_id: number, @Body() body: Partial<Board>) {
    const updatedBoard = await this.boardsService.updateBoard(board_id, body);
    return { message: '게시글이 수정되었습니다.', data: updatedBoard };
  }

  // 게시글 삭제
  @Delete(':boardId')
  async deleteBoard(@Param('boardId') board_id: number) {
    await this.boardsService.deleteBoard(board_id);
    return { message: '게시글이 삭제되었습니다.' };
  }
}
