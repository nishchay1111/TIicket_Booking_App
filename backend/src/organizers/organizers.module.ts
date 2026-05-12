import { Module } from '@nestjs/common';
import { OrganizersController } from './organizers.controller';
import { OrganizersService } from './organizers.service';
import { JsonStoreService } from '../common/json-store.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ThisEndsRightHere^71364andNow',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [OrganizersController],
  providers: [OrganizersService, JsonStoreService],
})
export class OrganizersModule {}