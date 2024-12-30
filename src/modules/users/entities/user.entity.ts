import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users') // TypeORM에서 해당 클래스가 데이터베이스 테이블과 매핑됨
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string; // UUID를 사용하여 고유 ID 자동 생성

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  mail: string; // 이메일은 고유 값이며, 필수 입력

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string; // 비밀번호는 필수 입력

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  name: string; // 이름(닉네임) 고유 값이며, 필수 입력

  @Column({ type: 'varchar', nullable: true })
  profile_image: string; // 프로필 이미지는 선택 입력 (현재는 기본값 처리 예정)
}
