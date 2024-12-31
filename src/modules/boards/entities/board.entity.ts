import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('boards') // TypeORM에서 해당 클래스가 boards 테이블과 매핑됨
export class Board {
  @PrimaryGeneratedColumn() // 자동으로 증가하는 기본 키
  board_id: number;

  @Column({ type: 'uuid', nullable: false }) // 작성자 ID, UUID 형식
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false }) // 게시글 제목
  title: string;

  @Column({ type: 'bigint', default: 0, nullable: true }) // 가격 (선택 입력)
  price: number;

  @Column({ type: 'text', nullable: false }) // 게시글 내용
  contents: string;

  @Column({ type: 'varchar', length: 255, nullable: false }) // 위치 정보
  location: string;

  @Column({ type: 'text', nullable: true }) // 이미지 경로 (JSON 문자열로 저장)
  images: string;

  @Column({ type: 'boolean', default: false }) // 게시글 상태 (구인중/구인완료)
  status: boolean;

  @CreateDateColumn() // 생성일시 자동 기록
  created_date: Date;

  @UpdateDateColumn() // 수정일시 자동 기록
  updated_date: Date;

  @DeleteDateColumn() // 삭제일시 자동 기록
  deleted_date: Date;
}
