import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  console.log('Initializing NestJS application...');
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('User API')
    .setDescription('회원가입 및 회원 삭제 API 문서')
    .setVersion('1.0')
    .build();
  console.log('Setting up Swagger...');
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 등록된 모든 라우트를 출력
  const server = app.getHttpAdapter();
  console.log(
    'Registered Routes:',
    server
      .getInstance()
      ._router.stack.filter((layer) => layer.route) // 라우트 객체만 필터링
      .map((layer) => layer.route.path),
  );

  console.log('Starting server on port 8080...');
  await app.listen(8080);
  console.log('Server is running on http://localhost:8080');
}
bootstrap();
