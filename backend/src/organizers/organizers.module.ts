import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { OrganizersController } from './organizers.controller';
import { OrganizersService } from './organizers.service';
import { JsonStoreService } from '../common/json-store.service';
import { JwtStrategy } from '../jwt.strategy';
import { RolesGuard } from '../RBAC/roles.guard';
import { UserGuard } from '../user.guard';
import { TokenBlacklistService } from '../common/token-blacklist.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // 👈 added
    JwtModule.registerAsync({                             // 👈 added
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [OrganizersController],
  providers: [
    OrganizersService,
    JsonStoreService,
    JwtStrategy,
    UserGuard,
    RolesGuard,
    TokenBlacklistService,
  ],
  exports: [OrganizersService, TokenBlacklistService],
})
export class OrganizersModule {}