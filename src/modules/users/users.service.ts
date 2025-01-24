import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    console.log('UsersService initialized with UserRepository:', this.userRepository);
  }

  async findUserByEmail(mail: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { mail } });
  }

  async findUserById(user_id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException('해당 회원 정보를 찾을 수 없습니다.');
    }

    return user;
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

  async updateUser(user_id: string, updateUserDto: UpdateUserDto & { currentPassword?: string }): Promise<User> {
    const user = await this.findUserById(user_id);

    // 비밀번호 변경 요청 처리
    if (updateUserDto.password) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('현재 비밀번호를 입력해야 합니다.');
      }

      // 현재 비밀번호 확인
      const isPasswordMatch = await bcrypt.compare(updateUserDto.currentPassword, user.password);
      if (!isPasswordMatch) {
        throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
      }

      // 새로운 비밀번호 해싱
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    // 업데이트된 데이터를 병합
    const updatedUser = Object.assign(user, updateUserDto);

    return this.userRepository.save(updatedUser);
  }

  async deleteUser(user_id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new Error('삭제할 회원 정보를 찾을 수 없습니다.');
    }
    await this.userRepository.delete(user_id);
  }
}
