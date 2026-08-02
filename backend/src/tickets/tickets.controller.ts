import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';

/**
 * Controller managing HTTP routing endpoints for customer ticketing operations.
 * Enforces global user authentication and role-based access control evaluations.
 */
@Controller('tickets')
@UseGuards(UserGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Handles incoming GET requests to fetch tickets matching the current session context.
   * Access is explicitly restricted to profiles possessing the USER role tier.
   * 
   * @param req - The inbound Express request context containing the authenticated user footprint.
   * @returns A collection layout containing all ticket profiles owned by the requesting agent.
   */
  @Get('my-tickets')
  @Roles(Role.USER)
  async getMyTickets(@Req() req: any) {
    return this.ticketsService.findTicketsByUser(req.user.id);
  }
}