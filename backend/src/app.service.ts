import { Injectable } from '@nestjs/common';

/**
 * Global application service responsible for root diagnostics,
 * baseline text configurations, and environment telemetry lookup maps.
 */
@Injectable()
export class AppService {
  /**
   * Compiles the standard application welcome identity string.
   * 
   * @returns A uniform text greeting block representing the API root.
   */
  getHello(): string {
    return 'Welcome to the Ticket Booking App API!';
  }

  /**
   * Gathers active server performance states and process platform identifiers.
   * 
   * @returns A system diagnostics payload mapping names, versions, and deployment modes.
   */
  getSystemInfo() {
    return {
      name: 'Ticket Booking Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
    };
  }
}