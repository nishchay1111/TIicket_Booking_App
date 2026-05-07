import { Module } from '@nestjs/common';
import { OrganizersController } from './organizers.controller';
import { OrganizersService } from './organizers.service';
import { JsonStoreService } from '../common/json-store.service';

@Module({
  controllers: [OrganizersController],
  providers: [OrganizersService, JsonStoreService],
})
export class OrganizersModule {}