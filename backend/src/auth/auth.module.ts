import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt.strategy'; // Adjust path if needed
import { JsonStoreService } from '../common/json-store.service';
import { UserGuard } from '../user.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ThisEndsRightHere^71364andNow',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JsonStoreService, JwtStrategy, UserGuard],
  exports: [AuthService],
})
export class AuthModule {}