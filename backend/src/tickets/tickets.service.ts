import { Injectable } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';

@Injectable()
export class TicketsService {
  constructor(private readonly jsonStore: JsonStoreService) {}

  async findTicketsByUser(userId: string) {
    // Load all tickets from your JSON storage
    const allTickets = this.jsonStore.loadData('tickets');
    
    // Filter tickets belonging to the logged-in user
    const userTickets = allTickets.filter(ticket => ticket.user_id === userId);
    
    return {
      success: true,
      count: userTickets.length,
      tickets: userTickets
    };
  }
}