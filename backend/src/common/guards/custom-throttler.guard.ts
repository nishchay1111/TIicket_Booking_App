import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Overriding this method to customize the error.
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    
    // In many versions, 'name' is available directly or within the detail.
    // We'll use a generic log if the name property is elusive in your specific version.
    console.warn(`[Rate Limit] A request was blocked. Limit: ${throttlerLimitDetail.limit}, TTL: ${throttlerLimitDetail.ttl}`);

    throw new ThrottlerException(
      'You have sent too many requests in a short period. Please wait a moment and try again.'
    );
  }

  /**
   * Identifies the user by ID (if logged in) or IP address.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Note: Passport attaches the user to req.user during validation
    return req.user?.id || req.ip;
  }
}