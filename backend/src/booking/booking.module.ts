import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { JsonStoreService } from '../common/json-store.service';
import { PassportModule } from '@nestjs/passport';

/**
 * Feature module responsible for orchestrating ticket reservations,
 * event querying components, and registering local file database persistence dependencies.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [BookingController],
  providers: [BookingService, JsonStoreService],
})
export class BookingModule {}