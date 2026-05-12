import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard'; // 👈 Updated path
import { Roles } from '../RBAC/roles.decorator';  // 👈 Updated path
import { Role } from '../RBAC/role.enum';          // 👈 Added Enum import

// Type-only imports for strict TS compliance on your Mac
import type { BookTicketDto } from './dto/book-ticket.dto';
import type { Request } from 'express';

@Controller('booking')
@UseGuards(UserGuard, RolesGuard) 
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('fetchallevents')
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN) // 👈 Use Enum
  async fetchAllEvents() {
    return this.bookingService.fetchAllEvents();
  }

  @Post('fetchalltickets')
  @Roles(Role.USER) // 👈 Use Enum
  async fetchAllTickets(@Req() req: any) {
    return this.bookingService.fetchAllTickets(req.user.id);
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