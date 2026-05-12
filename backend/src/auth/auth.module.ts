import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt.strategy';
import { JsonStoreService } from '../common/json-store.service';
import { UserGuard } from '../user.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../RBAC/roles.guard'; // 👈 Import your new guard

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ThisEndsRightHere^71364andNow',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JsonStoreService, 
    JwtStrategy, 
    UserGuard,
    {
      provide: APP_GUARD, // 👈 This makes RBAC work globally
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}