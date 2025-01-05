import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Board } from './board.entity';

@Entity('board_images')
export class BoardImage {
  @ApiProperty({
    description: '이미지 ID (자동 증가)',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  image_id: number;

  @ApiProperty({
    description: '이미지 URL',
    example: 'https://example.com/image.jpg',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  image_url: string;

  @ApiProperty({
    description: '썸네일 여부',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  is_thumbnail: boolean;

  @ApiProperty({
    description: '이미지가 속한 게시글 정보',
    type: () => Board,
  })
  @ManyToOne(() => Board, (board) => board.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;
}
