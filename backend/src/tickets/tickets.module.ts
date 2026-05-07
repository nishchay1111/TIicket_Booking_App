import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { JsonStoreService } from '../common/json-store.service';
import { UserGuard } from '../user.guard';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, JsonStoreService, UserGuard],
})
export class TicketsModule {}