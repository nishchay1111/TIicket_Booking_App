import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../jwt.strategy';
import { JsonStoreService } from '../common/json-store.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard';
import { TokenBlacklistService } from '../common/token-blacklist.service';

/**
 * Feature module responsible for orchestrating authentication infrastructure,
 * token signing policies, guard registries, and request boundary security strategy bindings.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JsonStoreService,
    JwtStrategy,
    UserGuard,
    RolesGuard,
    TokenBlacklistService,
  ],
  exports: [AuthService, TokenBlacklistService],
})
export class AuthModule {}