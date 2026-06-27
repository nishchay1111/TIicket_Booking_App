import { Injectable, OnModuleInit } from '@nestjs/common';
import { JsonStoreService } from './json-store.service';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';

interface BlacklistedToken {
  token: string;
  expiresAt: number; // UTC Epoch timestamp in milliseconds
}

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
  ) {}

  // Automatically purges old records when the server boots up
  onModuleInit() {
    this.clearExpiredLogs();
  }

  /**
   * Adds a token to the blacklist JSON file if it hasn't expired yet
   */
  async revokeToken(token: string) {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];
    
    try {
      const decoded = this.jwtService.decode(token) as { exp: number };
      const now = Date.now();
      
      // Calculate exact expiration time in milliseconds
      const expiresAt = decoded?.exp ? decoded.exp * 1000 : now;

      // 🛑 Core rule: Only log it if its natural expiration is still in the future!
      if (expiresAt > now) {
        if (!blacklisted.some(t => t.token === token)) {
          blacklisted.push({ token, expiresAt });
          this.jsonStore.saveData('token_blacklist', blacklisted);
        }
      }
    } catch {
      // If the token is completely mangled or unparseable, ignore it safely
      return;
    }
  }

  /**
   * Checks if an incoming token exists in our active blacklist log
   */
  isTokenRevoked(token: string): boolean {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];
    return blacklisted.some(t => t.token === token);
  }

  /**
   * Automated Helper: Automatically runs every hour to remove tokens 
   * that have naturally expired past the current time.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  clearExpiredLogs() {
    const blacklisted: BlacklistedToken[] = this.jsonStore.loadData('token_blacklist') || [];
    const now = Date.now();

    // Filters out and keeps ONLY tokens whose expiration date is still in the future
    const activeBlacklist = blacklisted.filter(t => t.expiresAt > now);

    this.jsonStore.saveData('token_blacklist', activeBlacklist);
  }
}