import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';
import { Public } from '../RBAC/public.decorator';

import { BookTicketDto } from './dto/book-ticket.dto';
import { Request } from 'express';

/**
 * Controller responsible for managing client-facing event lookups,
 * secure ticket reservations, processing cancellations, and transaction history retrieval.
 */
@Controller('booking')
@UseGuards(UserGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  /**
   * Retrieves a comprehensive collection of all public event records.
   * Access: Public.
   */
  @Public()
  @Get('fetchallevents')
  async fetchAllEvents() {
    return this.bookingService.fetchAllEvents();
  }

  /**
   * Retrieves all ticket transactions associated with the logged-in user profile.
   * Access: Restricted to accounts with the USER role.
   * @param req - The request context holding the decrypted user identity metadata.
   */
  @Post('fetchalltickets')
  @Roles(Role.USER)
  async fetchAllTickets(@Req() req: any) {
    return this.bookingService.fetchAllTickets(req.user.id);
  }

  /**
   * Looks up granular details for an individual event record by its primary key identifier.
   * Access: Public.
   * @param eventId - The unique system identifier for the requested event listing.
   */
  @Public()
  @Get('fetchevent/:id')
  async fetchEventById(@Param('id') eventId: string) {
    return this.bookingService.fetchEventById(eventId);
  }

  /**
   * Generates a structural ticket booking ledger under the user profile for a designated show runtime.
   * Access: Restricted to accounts with the USER role.
   * @param showId - The specific scheduling or show boundary identifier.
   * @param bookTicketDto - The validated inventory request details payload.
   * @param req - The request context containing security context strings.
   */
  @Post('bookticket/:id')
  @Roles(Role.USER)
  async bookTicket(
    @Param('id') showId: string,
    @Body() bookTicketDto: BookTicketDto,
    @Req() req: any
  ) {
    return this.bookingService.bookTicket(showId, bookTicketDto, req.user);
  }

  /**
   * Invalidates a previous ticket reservation ledger mapping and releases inventory quotas.
   * Access: Restricted to accounts with USER or ADMIN roles.
   * @param ticketId - The specific transactional identification ticket record being purged.
   * @param req - The incoming payload contextual identity data map.
   */
  @Delete('deleteticket/:id')
  @Roles(Role.USER, Role.ADMIN)
  async deleteTicket(@Param('id') ticketId: string, @Req() req: any) {
    return this.bookingService.deleteTicket(ticketId, req.user.id);
  }
}