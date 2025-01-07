import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ description: '게시글 제목', example: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용', example: '게시글 내용' })
  contents: string;

  @ApiProperty({ description: '가격 (선택)', example: 100000, required: false })
  price?: number;

  @ApiProperty({ description: '위치 정보', example: '서울특별시 강남구' })
  location: string;

  @ApiProperty({ description: '구인 상태 (구인중 또는 구인완료)', example: '구인중' })
  @IsIn(['구인중', '구인완료'], { message: 'status는 구인중 또는 구인완료만 가능합니다.' })
  status: string;

  @ApiProperty({
    description: '이미지 파일 배열',
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  files: any[];
}
