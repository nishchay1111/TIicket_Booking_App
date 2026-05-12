import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';

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

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ThisEndsRightHere^71364andNow', // Match your Strategy secret
      signOptions: { expiresIn: '1h' },
    }),AuthModule,BookingModule,AdminModule,OrganizersModule,TicketsModule],
  controllers: [AppController],
  providers: [AppService,JsonStoreService,JwtStrategy,UserGuard],
  exports: [PassportModule, JwtStrategy, UserGuard] 
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