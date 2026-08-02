import { Injectable, OnModuleInit } from '@nestjs/common';
import { JsonStoreService } from './json-store.service';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Structural definition for an invalidated security token tracking log.
 */
interface BlacklistedToken {
  token: string;
  expiresAt: number;
  type?: 'access' | 'refresh';
}

/**
 * Service managing token invalidation cycles, checking token revocation state, 
 * and executing periodic maintenance to purge expired token records.
 */
@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * NestJS lifecycle hook that runs on module initialization.
   * Evicts already expired tokens instantly when the application spins up.
   */
  onModuleInit() {
    this.clearExpiredLogs();
  }

  /**
   * Registers an unexpired token string within the blacklist layer until its formal expiration timestamp.
   * @param token - The raw JSON Web Token string to invalidate.
   * @param type - The classification category distinguishing access and refresh vectors.
   */
  async revokeToken(token: string, type: 'access' | 'refresh' = 'access') {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];

    try {
      const decoded   = this.jwtService.decode(token) as { exp: number };
      const now       = Date.now();
      const expiresAt = decoded?.exp ? decoded.exp * 1000 : now;

      if (expiresAt > now) {
        if (!blacklisted.some(t => t.token === token)) {
          blacklisted.push({ token, expiresAt, type });
          this.jsonStore.saveData('token_blacklist', blacklisted);
        }
      }
    } catch {
      return;
    }
  }

  /**
   * Assesses whether a specific security token token string is registered as revoked.
   * @param token - The verification string target being checked.
   * @returns A truthy evaluation signaling if the provided token has been blocked.
   */
  isTokenRevoked(token: string): boolean {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];
    return blacklisted.some(t => t.token === token);
  }

  /**
   * Automated cron schedule that filters out items whose expiration timestamps are past current time.
   * Executes automatically at ten-minute recurring boundaries.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  clearExpiredLogs() {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];
    const now             = Date.now();
    const activeBlacklist = blacklisted.filter(t => t.expiresAt > now);
    this.jsonStore.saveData('token_blacklist', activeBlacklist);
  }
}