import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JsonStoreService } from '../common/json-store.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, JsonStoreService],
})
export class AdminModule {}