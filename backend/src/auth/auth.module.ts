import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JsonStoreService } from '../common/json-store.service';
import { UserGuard } from '../user.guard';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JsonStoreService, 
    UserGuard
  ],
  // Exporting AuthService in case other modules (like Admin) need to use its logic
  exports: [AuthService],
})
export class AuthModule {}