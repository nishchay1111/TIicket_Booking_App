import { Controller, Get, Post, Body, Res, Req, Delete, Put, Param, UseGuards } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UserGuard } from '../user.guard';
import type { Response } from 'express';

@Controller('organizers')
export class OrganizersController {
  constructor(private readonly orgService: OrganizersService) {}

  @Post('createorganizer')
  async signup(@Body() createOrgDto: CreateOrganizerDto, @Res({ passthrough: true }) res: Response) {
    return this.orgService.createOrganizer(createOrgDto, res);
  }

  @Post('organizerlogin')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    return this.orgService.login(body, res);
  }

  @UseGuards(UserGuard)
  @Get('fetchorganizersevents')
  async getEvents(@Req() req: any) {
    return this.orgService.getMyEvents(req.user.id);
  }

  @UseGuards(UserGuard)
  @Post('createEvent')
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    return this.orgService.createEvent(createEventDto, req.user);
  }
}