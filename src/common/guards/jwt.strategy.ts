import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'ko_chock_chock_jwt', // 환경 변수 또는 기본값 사용
    });
  }

  async validate(payload: any) {
    return {
      user_id: payload.sub, // user_id로 매핑 (request.user.user_id에 저장됨)
      username: payload.username,
    };
  }
}
