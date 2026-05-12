import { Injectable } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';

@Injectable()
export class TicketsService {
  constructor(private readonly jsonStore: JsonStoreService) {}

  async findTicketsByUser(userId: string) {
    const allTickets = this.jsonStore.loadData('tickets');
    
    // Passport ensures userId and role are valid before this runs
    const userTickets = allTickets.filter(ticket => ticket.user_id === userId);
    
    return {
      success: true,
      count: userTickets.length,
      tickets: userTickets
    };
  }
}