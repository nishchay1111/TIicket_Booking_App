import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  imports: [AuthModule,BookingModule,AdminModule,OrganizersModule,TicketsModule],
  controllers: [AppController],
  providers: [AppService,JsonStoreService,UserGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: () => void) => {
        // Example: Force HTTPS in production (similar to professional Express setups)
        const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
        if (!isHttps && process.env.NODE_ENV === 'production') {
          return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
      })
      .forRoutes('*'); // Apply to all routes
  }
}