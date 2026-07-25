import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard'; // 👈 Updated path
import { Roles } from '../RBAC/roles.decorator';  // 👈 Updated path
import { Role } from '../RBAC/role.enum';          // 👈 Added Enum import
import { Public } from '../RBAC/public.decorator';

// Type-only imports for strict TS compliance on your Mac
import { BookTicketDto } from './dto/book-ticket.dto';
import { Request } from 'express';

@Controller('booking')
@UseGuards(UserGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Public()
  @Get('fetchallevents')
  async fetchAllEvents() {
    return this.bookingService.fetchAllEvents();
  }

  @Post('fetchalltickets')
  @Roles(Role.USER) // 👈 Use Enum
  async fetchAllTickets(@Req() req: any) {
    return this.bookingService.fetchAllTickets(req.user.id);
  }

  @Public()
  @Get('fetchevent/:id')
  async fetchEventById(@Param('id') eventId: string) {
    return this.bookingService.fetchEventById(eventId);
  }

  @Post('bookticket/:id')
  @Roles(Role.USER) // 👈 Use Enum
  async bookTicket(
    @Param('id') showId: string,
    @Body() bookTicketDto: BookTicketDto,
    @Req() req: any
  ) {
    return this.bookingService.bookTicket(showId, bookTicketDto, req.user);
  }

  @Delete('deleteticket/:id')
  @Roles(Role.USER, Role.ADMIN) // 👈 Use Enum
  async deleteTicket(@Param('id') ticketId: string, @Req() req: any) {
    return this.bookingService.deleteTicket(ticketId, req.user.id);
  }
}