import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Board } from './entities/board.entity';
import { BoardImage } from './entities/board-image.entity';
import { S3Service } from '../../common/s3/s3.service';
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      user_id: string;
    };
  }
}

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardImage)
    private readonly boardImageRepository: Repository<BoardImage>,
    private readonly dataSource: DataSource, // 트랜잭션을 위한 데이터 소스
    private readonly s3Service: S3Service, // S3 서비스
  ) {}

  // 게시글 생성 (트랜잭션 적용)
  async createBoard(
    data: Partial<Board>,
    files: Express.Multer.File[],
    request: Request, // 요청 객체 추가
  ): Promise<Board> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Received Data:', data);
      console.log('Received Files:', files);

      if (!data.title || !data.contents || !data.location) {
        throw new InternalServerErrorException('필수 데이터가 누락되었습니다.');
      }

      // 요청에서 user_id 추출
      const userId = request.user?.user_id;
      if (!userId) {
        throw new InternalServerErrorException('user_id가 누락되었습니다.');
      }
      data.user_id = userId; // user_id 추가

      // 게시글 엔티티 생성 및 저장
      console.log('Creating board entity...');
      const board = this.boardRepository.create(data);
      const savedBoard = await queryRunner.manager.save(board);
      console.log('Board saved:', savedBoard);

      // 이미지 업로드 처리 및 저장
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        try {
          console.log('Uploading images...');
          imageUrls = await this.s3Service.uploadFiles(files); // S3에 파일 업로드 후 URL 반환
          console.log('Uploaded Image URLs:', imageUrls);
        } catch (uploadError) {
          console.error('S3 Upload Error:', uploadError.message);
          throw new InternalServerErrorException('이미지 업로드 중 에러 발생');
        }
      }

      const boardImages = imageUrls.map((url, index) =>
        this.boardImageRepository.create({
          image_url: url,
          is_thumbnail: index === 0, // 첫 번째 이미지를 썸네일로 지정
          board: savedBoard, // 게시글과 연관 설정
        }),
      );
      console.log('Board Images to save:', boardImages);

      if (boardImages.length > 0) {
        await queryRunner.manager.save(BoardImage, boardImages); // BoardImage 엔티티 저장
      }

      await queryRunner.commitTransaction(); // 트랜잭션 커밋
      console.log('Transaction committed.');
      return savedBoard;
    } catch (error) {
      console.error('Transaction error:', error.message);
      await queryRunner.rollbackTransaction(); // 트랜잭션 롤백
      throw new InternalServerErrorException('게시글 생성 중 에러 발생');
    } finally {
      await queryRunner.release(); // QueryRunner 해제
    }
  }

  // 페이징 처리된 게시글 리스트 조회
  async getAllBoards(page: number): Promise<{ data: Board[]; total: number }> {
    const take = 10; // 한 페이지당 10개 게시글
    const skip = (page - 1) * take; // 건너뛸 게시글 수 계산

    // 게시글과 이미지 관계를 포함해 조회
    const [data, total] = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect(
        'board.images',
        'image',
        'image.is_thumbnail = true', // 썸네일만 조인
      )
      .leftJoinAndSelect('board.user', 'user') // 작성자 정보 포함
      .select([
        'board.board_id',
        'board.title',
        'board.contents',
        'board.price',
        'board.location',
        'board.status',
        'board.created_date',
        'board.updated_date',
        'image.image_url', // 썸네일 이미지 URL만 선택
        'user.name', // 작성자 이름
        'user.profile_image', // 작성자 프로필 이미지
      ])
      .skip(skip)
      .take(take)
      .orderBy('board.created_date', 'DESC') // 최신순 정렬
      .getManyAndCount();

    return { data, total }; // 게시글 데이터와 전체 개수 반환
  }

  // 특정 게시글 조회
  async getBoardById(board_id: number): Promise<Board> {
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.images', 'image') // 모든 이미지 포함
      .leftJoinAndSelect('board.user', 'user') // 작성자 정보 포함
      .select([
        'board.board_id',
        'board.title',
        'board.contents',
        'board.price',
        'board.location',
        'board.status',
        'board.created_date',
        'board.updated_date',
        'image.image_url',
        'image.is_thumbnail',
        'user.name',
        'user.profile_image',
      ])
      .where('board.board_id = :board_id', { board_id })
      .getOne();
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    return board;
  }

  // 게시글 수정
  async updateBoard(board_id: number, data: Partial<Board>): Promise<Board> {
    const board = await this.getBoardById(board_id); // 기존 게시글 조회
    Object.assign(board, data); // 데이터 병합
    return await this.boardRepository.save(board); // 수정된 데이터 저장
  }

  // 사용자가 작성한 게시글 조회
  async getBoardsByUserId(user_id: string): Promise<Board[]> {
    const boards = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.images', 'image', 'image.is_thumbnail = true') // 썸네일만 포함
      .leftJoinAndSelect('board.user', 'user') // 작성자 정보 포함
      .select([
        'board.board_id',
        'board.title',
        'board.contents',
        'board.price',
        'board.location',
        'board.status',
        'board.created_date',
        'board.updated_date',
        'image.image_url', // 썸네일 URL
        'user.name', // 작성자 이름
        'user.profile_image', // 작성자 프로필 이미지
      ])
      .where('board.user_id = :user_id', { user_id })
      .orderBy('board.created_date', 'DESC')
      .getMany();

    if (!boards || boards.length === 0) {
      throw new NotFoundException('해당 사용자가 작성한 게시글을 찾을 수 없습니다.');
    }

    return boards;
  }

  // 게시글 삭제
  async deleteBoard(board_id: number): Promise<void> {
    const board = await this.getBoardById(board_id); // 기존 게시글 조회
    await this.boardRepository.softRemove(board); // 소프트 삭제
  }
}
