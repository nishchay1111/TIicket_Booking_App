import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookTicketDto } from './dto/book-ticket.dto';
import { UserGuard } from '../user.guard';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('fetchallevents')
  async fetchAllEvents() {
    return this.bookingService.fetchAllEvents();
  }

  @UseGuards(UserGuard)
  @Post('fetchalltickets')
  async fetchAllTickets(@Req() req: any) {
    return this.bookingService.fetchAllTickets(req.user.id);
  }

  @UseGuards(UserGuard)
  @Post('bookticket/:id')
  async bookTicket(
    @Param('id') showId: string,
    @Body() bookTicketDto: BookTicketDto,
    @Req() req: any
  ) {
    // req.user contains the full user/organizer object from the guard
    return this.bookingService.bookTicket(showId, bookTicketDto, req.user);
  }

  @UseGuards(UserGuard)
  @Delete('deleteticket/:id')
  async deleteTicket(@Param('id') ticketId: string, @Req() req: any) {
    return this.bookingService.deleteTicket(ticketId, req.user.id);
  }
}