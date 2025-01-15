import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: [
    //   'https://kochokchok.shop', // 배포된 프론트엔드 주소
    //   'http://localhost:3000', // 로컬 개발 환경
    // ],
    origin: '*',
    credentials: true, // 쿠키 전송 허용
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // 허용할 메서드
    allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
  });
  app.useGlobalPipes(new ValidationPipe());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('API Documentation') // 제목
    .setDescription('API endpoints and documentation') // 설명
    .setVersion('1.0') // 버전
    .addBearerAuth(
      // Bearer Token 추가
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token', // 이름 설정
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 라우트 디버깅 활성화
  const server = app.getHttpAdapter();
  console.log('Routes:', server.getHttpServer()._events.request._router.stack);

  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
