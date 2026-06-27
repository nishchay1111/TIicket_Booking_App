import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';
import { APP_GUARD, Reflector } from '@nestjs/core';

// Configuration
import { ConfigModule, ConfigService } from '@nestjs/config';

// Task Scheduling (Cron Job Engine)
import { ScheduleModule } from '@nestjs/schedule';

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
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 20,
    }, {
      name: 'long',
      ttl: 3600000,
      limit: 500,
    }]),
    PassportModule.register({ defaultStrategy: 'jwt' }), // 👈 added back
    JwtModule.registerAsync({                             // 👈 added back
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    AuthModule,
    BookingModule,
    AdminModule,
    OrganizersModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [
    Reflector,
    AppService,
    JsonStoreService,
    JwtStrategy,
    UserGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [PassportModule, JwtModule, JwtStrategy, UserGuard, RolesGuard],
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