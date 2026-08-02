import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root application controller managing baseline system entry points,
 * welcome diagnostics, and application health status telemetry.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Handles incoming root HTTP GET requests.
   * 
   * @returns A string containing the core application welcome message.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Handles application health and subsystem performance checks.
   * 
   * @returns An object containing core system health and runtime performance details.
   */
  @Get('health')
  getHealth() {
    return this.appService.getSystemInfo();
  }
}