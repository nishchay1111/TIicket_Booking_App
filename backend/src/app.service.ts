import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Returns a welcome message for the API root.
   */
  getHello(): string {
    return 'Welcome to the Ticket Booking App API!';
  }

  /**
   * Returns basic system information.
   * Useful for the health check endpoint in AppController.
   */
  getSystemInfo() {
    return {
      name: 'Ticket Booking Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform, // Will show 'darwin' on your MacBook Air
    };
  }
}