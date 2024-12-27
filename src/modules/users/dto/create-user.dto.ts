import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  mail: string; // 이메일 유효성 검사

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, {
    message: '비밀번호가 너무 약합니다. 영문, 숫자, 특수문자를 포함해야 합니다.',
  })
  password: string; // 비밀번호 최소 길이 6자 및 복잡성 검사

  @IsString()
  @IsNotEmpty()
  name: string; // 이름(닉네임) 필수 입력
}
