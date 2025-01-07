import { Controller, Post, Body, HttpException, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-login.dto';
import { Response, Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(loginDto);

      // Refresh Token을 HttpOnly 쿠키에 저장
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // HTTPS 환경에서만 동작
        sameSite: 'strict', // CSRF 공격 방지
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 (밀리초 단위)
      });

      console.log('Refresh Token set in cookie:', refreshToken);

      return {
        status: 200,
        message: '로그인이 성공적으로 완료되었습니다.',
        accessToken, // Access Token은 응답으로 반환
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

  // refreshToken으로 accessToken 재발급
  @Post('refresh')
  @ApiBearerAuth('access-token') // Bearer 인증 추가
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const oldRefreshToken = req.cookies['refreshToken'];

      if (!oldRefreshToken) {
        throw new HttpException('Refresh Token이 없습니다.', HttpStatus.UNAUTHORIZED);
      }

      const { accessToken, refreshToken } = await this.authService.refresh(oldRefreshToken);

      // 새로운 Refresh Token을 쿠키에 설정
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        // TODO: 추후 도메인 설정해서 로컬/서버 환경 분리해주기
      });

      console.log('Refresh Token in Cookie:', req.cookies['refreshToken']);

      return {
        status: 200,
        message: '새로운 Access Token과 Refresh Token이 발급되었습니다.',
        accessToken,
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

  // 로그아웃
  @ApiOperation({ summary: '로그아웃', description: 'Access Token 및 Refresh Token을 무효화합니다.' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      example: { message: '로그아웃이 성공적으로 처리되었습니다.' },
    },
  })
  @Post('logout')
  @ApiBearerAuth('access-token') // Bearer 인증 추가
  async logout(@Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Access Token이 필요합니다.');
    }

    const accessToken = authHeader.replace('Bearer ', '').trim();
    const userId = await this.authService.getUserIdFromAccessToken(accessToken);

    // Access Token 및 Refresh Token 무효화
    await this.authService.logout(accessToken, userId);

    // Refresh Token 삭제를 위해 클라이언트 쿠키 초기화
    res.clearCookie('refresh_token', { httpOnly: true, secure: true });
    res.status(200).json({ message: '로그아웃이 성공적으로 처리되었습니다.' });
  }
}
