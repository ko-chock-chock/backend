import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Board } from './entities/board.entity';
import { Request } from 'express';

@ApiTags('Boards') // Swagger에서 "Boards" 그룹으로 표시
@Controller('api/v1/boards')
@ApiBearerAuth('access-token') // Bearer 인증 추가
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // 게시글 생성
  @ApiOperation({ summary: '게시글 생성', description: '새로운 게시글을 생성합니다.' })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    type: Board,
  })
  @ApiBody({ type: CreateBoardDto })
  @Post('newBoard')
  @ApiConsumes('multipart/form-data') // Swagger에서 multipart/form-data 지원
  @UseInterceptors(FilesInterceptor('files')) // 다중 파일 업로드 처리
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ) {
    console.log('Received Files:', files);

    if (!files || files.length === 0) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    files.forEach((file, index) => {
      if (!file.buffer) {
        console.error(`File #${index + 1} is missing buffer data`);
        throw new BadRequestException(`파일 데이터가 유효하지 않습니다. (파일 #${index + 1})`);
      }
      console.log(`File #${index + 1} - Buffer:`, file.buffer);
    });

    const newBoard = await this.boardsService.createBoard(createBoardDto, files, request);
    console.log('Response Data:', newBoard);

    return { message: '게시글이 생성되었습니다.', data: newBoard };
  }

  // 게시글 목록 조회
  @ApiOperation({ summary: '게시글 목록 조회', description: '모든 게시글 목록을 조회합니다.' })
  @ApiQuery({ name: 'page', description: '페이지 번호 (기본값: 1)', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    schema: {
      example: {
        message: '게시글 목록 조회 성공',
        data: [
          {
            board_id: 1,
            title: '게시글 제목',
            contents: '게시글 내용',
            price: 100000,
            location: '서울특별시 강남구',
            status: '구인중',
            created_date: '2025-01-04T12:00:00Z',
            updated_date: '2025-01-04T12:00:00Z',
            image_url: 'https://example.com/image1.jpg',
            user: {
              name: '작성자 이름',
              profile_image: 'https://example.com/profile.jpg',
            },
          },
        ],
      },
    },
  })
  @Get()
  @UseInterceptors(ClassSerializerInterceptor) // class-transformer 적용
  async getAllBoards(@Query('page') page: number = 1) {
    const result = await this.boardsService.getAllBoards(page);
    return { message: '게시글 목록 조회 성공', data: result };
  }

  // 게시글 조회
  @ApiOperation({ summary: '게시글 조회', description: '특정 게시글을 ID로 조회합니다.' })
  @ApiParam({ name: 'boardId', description: '조회할 게시글 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '게시글 조회 성공',
    schema: {
      example: {
        message: '게시글 조회 성공',
        data: {
          board_id: 1,
          title: '게시글 제목',
          contents: '게시글 내용',
          price: 100000,
          location: '서울특별시 강남구',
          status: '구인중',
          created_date: '2025-01-04T12:00:00Z',
          updated_date: '2025-01-04T12:00:00Z',
          images: [
            {
              image_id: 1,
              image_url: 'https://example.com/image1.jpg',
              is_thumbnail: true,
            },
          ],
          user: {
            name: '작성자 이름',
            profile_image: 'https://example.com/profile.jpg',
          },
        },
      },
    },
  })
  @Get(':boardId')
  async getBoardById(@Param('boardId') board_id: number) {
    const board = await this.boardsService.getBoardById(board_id);
    return {
      message: '게시글 조회 성공',
      data: board,
    };
  }

  // 사용자가 작성한 게시글 조회
  @ApiOperation({ summary: '사용자가 작성한 게시글 조회', description: 'user_id로 사용자가 작성한 게시글 조회' })
  @ApiParam({ name: 'user_id', description: '사용자 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '사용자가 작성한 게시글 조회 성공',
    schema: {
      example: {
        message: '사용자가 작성한 게시글 조회 성공',
        data: [
          {
            board_id: 1,
            title: '게시글 제목',
            contents: '게시글 내용',
            price: 100000,
            location: '서울특별시 강남구',
            status: '구인중',
            created_date: '2025-01-04T12:00:00Z',
            updated_date: '2025-01-04T12:00:00Z',
            image_url: 'https://example.com/image1.jpg',
            user: {
              name: '작성자 이름',
              profile_image: 'https://example.com/profile.jpg',
            },
          },
        ],
      },
    },
  })
  @Get('user/:user_id')
  async getBoardsByUserId(@Param('user_id') user_id: string) {
    const boards = await this.boardsService.getBoardsByUserId(user_id);
    return { message: '사용자가 작성한 게시글 조회 성공', data: boards };
  }

  // 게시글 수정
  @ApiOperation({ summary: '게시글 수정', description: '특정 게시글을 수정합니다.' })
  @ApiParam({ name: 'boardId', description: '수정할 게시글 ID', example: 1 })
  @ApiConsumes('multipart/form-data') // Swagger에서 multipart/form-data 지원
  @UseInterceptors(FilesInterceptor('files')) // 다중 파일 업로드 처리
  @ApiBody({ type: UpdateBoardDto })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    type: Board,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':boardId/edit')
  @ApiConsumes('multipart/form-data') // Swagger에서 multipart/form-data 지원
  @UseInterceptors(FilesInterceptor('files')) // 다중 파일 업로드 처리
  async updateBoard(
    @Param('boardId') board_id: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const updatedBoard = await this.boardsService.updateBoard(board_id, updateBoardDto, files);

    return { message: '게시글이 수정되었습니다.', data: updatedBoard };
  }

  // 게시글 삭제
  @ApiOperation({ summary: '게시글 삭제', description: '특정 게시글을 삭제합니다.' })
  @ApiParam({ name: 'boardId', description: '삭제할 게시글 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
    schema: {
      example: {
        message: '게시글이 삭제되었습니다.',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':boardId')
  async deleteBoard(@Param('boardId') board_id: number) {
    await this.boardsService.deleteBoard(board_id);
    return { message: '게시글이 삭제되었습니다.' };
  }
}
