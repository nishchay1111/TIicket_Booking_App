import { Injectable, OnModuleInit } from '@nestjs/common';
import { JsonStoreService } from './json-store.service';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';

interface BlacklistedToken {
  token: string;
  expiresAt: number;
  type?: 'access' | 'refresh'; // 👈 added
}

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.clearExpiredLogs();
  }

  async revokeToken(token: string, type: 'access' | 'refresh' = 'access') { // 👈 added type param
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];

    try {
      const decoded   = this.jwtService.decode(token) as { exp: number };
      const now       = Date.now();
      const expiresAt = decoded?.exp ? decoded.exp * 1000 : now;

      if (expiresAt > now) {
        if (!blacklisted.some(t => t.token === token)) {
          blacklisted.push({ token, expiresAt, type }); // 👈 store type
          this.jsonStore.saveData('token_blacklist', blacklisted);
        }
      }
    } catch {
      return;
    }
  }

  isTokenRevoked(token: string): boolean {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];
    return blacklisted.some(t => t.token === token);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  clearExpiredLogs() {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];
    const now             = Date.now();
    const activeBlacklist = blacklisted.filter(t => t.expiresAt > now);
    this.jsonStore.saveData('token_blacklist', activeBlacklist);
  }
}