import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // No prefix, this handles the root '/' route
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.appService.getSystemInfo();
  }
}