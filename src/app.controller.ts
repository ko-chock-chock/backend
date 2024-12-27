import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    console.log('AppController initialized!');
  }

  @Get()
  getHello(): string {
    console.log('GET / called');
    return this.appService.getHello();
  }

  @Get('test')
  getTest() {
    console.log('GET /test called');
    return { message: 'Test route is working!' };
  }
}
