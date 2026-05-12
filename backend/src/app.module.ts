import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';
import { APP_GUARD } from '@nestjs/core';

// Rate Limiting
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

// Passport & Auth Imports
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { AdminModule } from './admin/admin.module';
import { OrganizersModule } from './organizers/organizers.module';
import { TicketsModule } from './tickets/tickets.module';

// Shared Services and Guards
import { JsonStoreService } from './common/json-store.service';
import { UserGuard } from './user.guard';
import { RolesGuard } from './RBAC/roles.guard';

@Module({
  imports: [
    // 1. Configure the Sliding Window Throttler
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,   // 1 minute
      limit: 20,    // General limit: 20 requests per minute
    }, {
      name: 'long',
      ttl: 3600000, // 1 hour
      limit: 500,   // General limit: 500 requests per hour
    }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ThisEndsRightHere^71364andNow',
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    BookingModule,
    AdminModule,
    OrganizersModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JsonStoreService,
    JwtStrategy,
    UserGuard,
    // 2. Register Custom Throttler Guard Globally
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // 3. Register RolesGuard Globally
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [PassportModule, JwtStrategy, UserGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
        if (!isHttps && process.env.NODE_ENV === 'production') {
          return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
      })
      .forRoutes('*');
  }
}