import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ description: '게시글 제목', example: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용', example: '게시글 내용' })
  contents: string;

  @ApiProperty({ description: '가격 (선택)', example: 100000, required: false })
  price?: number;

  @ApiProperty({ description: '위치 정보', example: '서울특별시 강남구' })
  location: string;

  @ApiProperty({ description: '구인 상태', example: false })
  status: boolean;

  @ApiProperty({
    description: '이미지 파일 배열',
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  files: any[];
}
