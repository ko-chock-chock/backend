import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const accessToken = await this.authService.login(loginDto);
      return {
        status: 200,
        message: '로그인이 성공적으로 완료되었습니다.',
        accessToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: error.message,
          error: '인증 실패',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    try {
      const newAccessToken = await this.authService.refresh(refreshToken);
      return {
        status: 200,
        message: '새로운 Access Token이 발급되었습니다.',
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: error.message,
          error: '토큰 갱신 실패',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
