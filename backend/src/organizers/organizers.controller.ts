import {Controller, Get, Post, Body, Res, Req, UseGuards,UseInterceptors, ClassSerializerInterceptor} from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';
import { Throttle } from '@nestjs/throttler'; // 👈 Import Throttle

import type { CreateOrganizerDto } from './dto/create-organizer.dto';
import type { CreateEventDto } from './dto/create-event.dto';
import type { Response } from 'express';

@Controller('organizers')
@UseInterceptors(ClassSerializerInterceptor)
export class OrganizersController {
  constructor(private readonly orgService: OrganizersService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 👈 Limit organizer signups
  @Post('createorganizer')
  async signup(
    @Body() createOrgDto: CreateOrganizerDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    return this.orgService.createOrganizer(createOrgDto, res);
  }

  @Post('organizerlogin')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    return this.orgService.login(body, res);
  }

  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Get('fetchorganizersevents')
  async getEvents(@Req() req: any) {
    return this.orgService.getMyEvents(req.user.id);
  }

  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Throttle({ default: { limit: 2, ttl: 600000 } }) // 👈 Max 2 events per 10 minutes
  @Post('createEvent')
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    return this.orgService.createEvent(createEventDto, req.user);
  }
}