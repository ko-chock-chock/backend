import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) // Board 엔터티에 대한 TypeORM 리포지토리 주입
    private readonly boardRepository: Repository<Board>,
  ) {}

  // 게시글 생성
  async createBoard(data: Partial<Board>): Promise<Board> {
    const board = this.boardRepository.create(data); // 새 게시글 생성
    return await this.boardRepository.save(board); // 데이터베이스에 저장
  }

  // 게시글 리스트 조회
  async getAllBoards(): Promise<Board[]> {
    return await this.boardRepository.find(); // 모든 게시글 조회
  }

  // 특정 게시글 조회
  async getBoardById(board_id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { board_id } }); // 게시글 ID로 조회
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    return board;
  }

  // 게시글 수정
  async updateBoard(board_id: number, data: Partial<Board>): Promise<Board> {
    const board = await this.getBoardById(board_id); // 기존 게시글 조회
    Object.assign(board, data); // 수정된 데이터 병합
    return await this.boardRepository.save(board); // 데이터베이스에 저장
  }

  // 게시글 삭제
  async deleteBoard(board_id: number): Promise<void> {
    const board = await this.getBoardById(board_id); // 기존 게시글 조회
    await this.boardRepository.softRemove(board); // 소프트 삭제
  }
}
