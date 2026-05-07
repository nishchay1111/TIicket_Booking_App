import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { AdminController } from '../admin/admin.controller';
import { BookingService } from './booking.service';
import { AdminService } from '../admin/admin.service';
import { JsonStoreService } from '../common/json-store.service';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService, JsonStoreService],
})
export class AdminModule {}

@Module({
  controllers: [BookingController],
  providers: [BookingService, JsonStoreService],
})
export class BookingModule {}