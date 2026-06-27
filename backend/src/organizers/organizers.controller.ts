import {Controller, Get, Post, Body, Res, Req, UseGuards, UseInterceptors, ClassSerializerInterceptor} from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';
import { Throttle } from '@nestjs/throttler'; 

import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { Request, Response } from 'express'; // 👈 1. Added Request type here
import {Public} from '../RBAC/public.decorator'

@Controller('organizers')
@UseInterceptors(ClassSerializerInterceptor)
export class OrganizersController {
  constructor(private readonly orgService: OrganizersService) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) 
  @Post('createorganizer')
  async signup(
    @Body() createOrgDto: CreateOrganizerDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    return this.orgService.createOrganizer(createOrgDto, res);
  }

  @Public()
  @Post('organizerlogin')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    return this.orgService.login(body, res);
  }

  // 🟢 2. Added Organizer Logout Route
  @UseGuards(UserGuard) 
  @Post('logout')
  async logout(
    @Req() req: Request, 
    @Res({ passthrough: true }) res: Response
  ) {
    return this.orgService.logout(req, res);
  }

  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Get('fetchorganizersevents')
  async getEvents(@Req() req: any) {
    return this.orgService.getMyEvents(req.user.id);
  }

  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Throttle({ default: { limit: 2, ttl: 600000 } }) 
  @Post('createEvent')
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    return this.orgService.createEvent(createEventDto, req.user);
  }
}