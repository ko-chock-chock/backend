import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { LoginDto } from './dto/create-login.dto';
import * as bcrypt from 'bcryptjs'; // bcrypt 대신 bcryptjs 사용
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/redis/redis.service'; // Redis 연동을 위한 커스텀 서비스

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 로그인 처리
   * @param loginDto 사용자 로그인 정보 (이메일, 비밀번호)
   * @returns Access Token과 Refresh Token
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { mail, password } = loginDto;

    const user = await this.userService.findUserByEmail(mail);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const payload = { user_id: user.user_id, mail: user.mail };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    const redisAccessKey = `access_token:${user.user_id}`;
    const redisRefreshKey = `refresh_token:${user.user_id}`;
    await this.redisService.set(redisAccessKey, accessToken, 900);
    await this.redisService.set(redisRefreshKey, refreshToken, 604800);

    console.log('Redis Key (Access):', redisAccessKey);
    console.log('Redis Key (Refresh):', redisRefreshKey);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh Token 검증 및 새로운 Access Token 발급
   * @param refreshToken 클라이언트에서 전달받은 Refresh Token
   * @returns 새로운 Access Token과 Refresh Token
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const redisRefreshKey = `refresh_token:${decoded.user_id}`;
      const storedToken = await this.redisService.get(redisRefreshKey);

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 Refresh Token입니다.');
      }

      // 새로운 토큰 생성
      const newAccessToken = this.jwtService.sign(
        { user_id: decoded.user_id, mail: decoded.mail },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
      );
      const newRefreshToken = this.jwtService.sign(
        { user_id: decoded.user_id, mail: decoded.mail },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
      );

      // Redis에 새로운 토큰 저장
      const redisAccessKey = `auth:access_token:${decoded.user_id}`;
      await this.redisService.set(redisAccessKey, newAccessToken, 900); // 15분

      await this.redisService.set(redisRefreshKey, newRefreshToken, 604800); // 7일

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh Token 검증에 실패했습니다.');
    }
  }

  /**
   * 로그아웃 로직
   * @param refreshToken 클라이언트에서 전달받은 Refresh Token
   * @returns 새로운 Access Token과 Refresh Token
   */
  async logout(accessToken: string, userId: string): Promise<void> {
    // Access Token 무효화
    const accessTokenKey = `access_token:${userId}`;
    const accessResult = await this.redisService.del(accessTokenKey);
    if (accessResult === 0) {
      throw new UnauthorizedException('이미 무효화된 Access Token입니다.');
    }

    // Refresh Token 삭제
    const refreshTokenKey = `refresh_token:${userId}`;
    const refreshResult = await this.redisService.del(refreshTokenKey);
    if (refreshResult === 0) {
      console.warn('이미 삭제된 Refresh Token이거나 존재하지 않습니다.');
    }

    console.log(`로그아웃 처리 완료 - User ID: ${userId}`);
  }

  // Access Token에서 User ID 추출
  async getUserIdFromAccessToken(token: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return payload.user_id;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 Access Token입니다.');
    }
  }
}
