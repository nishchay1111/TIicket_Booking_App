import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard'; // 👈 Updated path
import { Roles } from '../RBAC/roles.decorator';  // 👈 Updated path
import { Role } from '../RBAC/role.enum';          // 👈 Updated path

@Controller('tickets')
@UseGuards(UserGuard, RolesGuard) // 👈 Protect the whole controller
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('my-tickets')
  @Roles(Role.USER) // 👈 Specifically allow the USER role
  async getMyTickets(@Req() req: any) {
    return this.ticketsService.findTicketsByUser(req.user.id);
  }
}