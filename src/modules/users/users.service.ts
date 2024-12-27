import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    console.log('UsersService initialized with UserRepository:', this.userRepository);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { mail, password, name } = createUserDto;

    // 중복 이메일 및 닉네임 체크
    const existingEmail = await this.userRepository.findOne({ where: { mail } });
    if (existingEmail) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const existingName = await this.userRepository.findOne({ where: { name } });
    if (existingName) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 로깅 (회원가입 시 정보 기록)
    fs.appendFileSync('signup.log', `새 유저 가입: ${mail} - ${new Date().toISOString()}\n`);

    // 새 유저 생성
    const newUser = this.userRepository.create({
      mail,
      password: hashedPassword, // 해싱된 비밀번호 저장
      name,
      profile_image: '', // 기본 프로필 이미지 설정 => 공란 (프론트에서 넣어주는 경우)
    });

    return await this.userRepository.save(newUser);
  }

  async deleteUser(user_id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new Error('삭제할 회원 정보를 찾을 수 없습니다.');
    }
    await this.userRepository.delete(user_id);
  }
}
