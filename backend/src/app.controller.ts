import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Root endpoint: Useful for checking if the server is live.
   * Path: GET /
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health Check: A standard practice in professional development.
   * Path: GET /health
   */
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: 'Ticket Booking API is running smoothly'
    };
  }
}