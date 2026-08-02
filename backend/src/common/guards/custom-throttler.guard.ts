import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';

/**
 * Custom rate-limiting guard extending the base ThrottlerGuard to provide 
 * user-aware tracking and specialized exception logging structures.
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {

  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * Intercepts rate-limit violations, logs telemetry warnings, and throws a tailored client exception.
   * @param context - The current execution context of the inbound request.
   * @param throttlerLimitDetail - Metadata details containing the breached limit configuration and TTL limits.
   * @throws ThrottlerException - A standardized error containing user-friendly constraint messages.
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    console.warn(`[Rate Limit] A request was blocked. Limit: ${throttlerLimitDetail.limit}, TTL: ${throttlerLimitDetail.ttl}`);
    throw new ThrottlerException(
      'You have sent too many requests in a short period. Please wait a moment and try again.'
    );
  }

  /**
   * Establishes the unique identification tracking key used to evaluate request volume boundaries.
   * Prioritizes authenticated user identities before falling back to evaluation by connection IP.
   * @param req - The raw incoming request payload map extracted from the execution context.
   * @returns A string token uniquely identifying the requesting consumer agent.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip;
  }
}