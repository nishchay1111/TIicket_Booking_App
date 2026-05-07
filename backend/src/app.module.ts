import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { AdminModule } from './admin/admin.module';
import { OrganizersModule } from './organizers/organizers.module';

// Shared Services and Guards
import { JsonStoreService } from './common/json-store.service';
import { UserGuard } from './user.guard';

@Module({
  imports: [
    // Registering all your feature modules
    AuthModule,
    BookingModule,
    AdminModule,
    OrganizersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JsonStoreService, // Shared data logic
    UserGuard,        // Shared security logic
  ],
})
export class AppModule implements NestModule {
  /**
   * We use the configure method to apply global-level logic 
   * similar to your original Express middleware.
   */
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