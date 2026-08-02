import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { OrganizersController } from './organizers.controller';
import { OrganizersService } from './organizers.service';
import { JsonStoreService } from '../common/json-store.service';
import { JwtStrategy } from '../jwt.strategy';
import { RolesGuard } from '../RBAC/roles.guard';
import { UserGuard } from '../user.guard';
import { TokenBlacklistService } from '../common/token-blacklist.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Feature module responsible for orchestrating organizer authentication profiles,
 * event administration, authorization guards, and incoming multimedia asset upload policies.
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

    MulterModule.register({
      storage: diskStorage({
        destination: './DataStore/Posters',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
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