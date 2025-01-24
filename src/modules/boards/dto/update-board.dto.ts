import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @ApiProperty({
    description: '이미지 파일 배열',
    type: 'string',
    format: 'binary',
    isArray: true,
    required: false,
  })
  files?: any[];
}
