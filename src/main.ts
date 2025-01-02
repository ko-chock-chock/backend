import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://kochokchok.shop', // 배포된 프론트엔드 주소
      'http://localhost:3000', // 로컬 개발 환경
    ],
    credentials: true, // 쿠키 전송 허용
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // 허용할 메서드
    allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
  });
  app.useGlobalPipes(new ValidationPipe());

  // 라우트 디버깅 활성화
  // const server = app.getHttpAdapter();
  // console.log('Routes:', server.getHttpServer()._events.request._router.stack);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
