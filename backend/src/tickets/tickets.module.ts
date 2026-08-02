import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { JsonStoreService } from '../common/json-store.service';
import { PassportModule } from '@nestjs/passport';

/**
 * NestJS module configuring the dependency injection container, routing structures, 
 * and authentication strategies for customer ticketing operations.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, JsonStoreService],
})
export class TicketsModule {}