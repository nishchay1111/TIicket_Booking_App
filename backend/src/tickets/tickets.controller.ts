import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { UserGuard } from '../user.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(UserGuard)
  @Get('my-tickets')
  async getMyTickets(@Req() req: any) {
    // req.user was attached by the UserGuard
    return this.ticketsService.findTicketsByUser(req.user.id);
  }
}