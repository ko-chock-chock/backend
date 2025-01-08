import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BoardImage } from './board-image.entity';
import { Expose } from 'class-transformer';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('boards')
export class Board {
  @ApiProperty({ description: '게시글 ID (자동 증가)', example: 1 })
  @PrimaryGeneratedColumn()
  board_id: number;

  @ApiProperty({ description: '작성자 UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @ApiProperty({ description: '게시글 제목', example: '게시글 제목 예시' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ApiProperty({ description: '게시글 내용', example: '이 게시글은 예시입니다.' })
  @Column({ type: 'text', nullable: false })
  contents: string;

  @ApiProperty({ description: '가격 정보 (선택적)', example: 100000, nullable: true })
  @Column({ type: 'bigint', nullable: true })
  price: number;

  @ApiProperty({ description: '위치 정보', example: '서울특별시 강남구', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @ApiProperty({
    description: '게시글 상태 (구인중/구인완료)',
    example: '구인중',
    default: '구인중',
  })
  @Column({
    type: 'enum',
    enum: ['구인중', '구인완료'], // 허용 가능한 값
    default: '구인중', // 기본값 설정
  })
  status: string;

  @ApiProperty({ description: '게시글 생성일시', example: '2025-01-03T12:00:00Z' })
  @CreateDateColumn()
  created_date: Date;

  @ApiProperty({ description: '게시글 수정일시', example: '2025-01-04T12:00:00Z' })
  @UpdateDateColumn()
  updated_date: Date;

  @ApiProperty({ description: '게시글 삭제일시', example: '2025-01-05T12:00:00Z', nullable: true })
  @DeleteDateColumn()
  deleted_date: Date;

  @ApiProperty({ description: '게시글에 첨부된 이미지 목록', type: () => [BoardImage] })
  @OneToMany(() => BoardImage, (image) => image.board, { cascade: true })
  images: BoardImage[];

  @ApiProperty({
    description: '게시글 썸네일 이미지 URL',
    example: 'https://example.com/thumbnail.jpg',
    nullable: true,
  })
  @Expose()
  get thumbnail(): string | null {
    const thumbnailImage = this.images?.find((image) => image.is_thumbnail);
    return thumbnailImage ? thumbnailImage.image_url : null;
  }

  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' }) // 유저와 게시글의 다대일 관계
  @JoinColumn({ name: 'user_id' })
  user: User;
}
