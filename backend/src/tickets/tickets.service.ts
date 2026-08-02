import { Injectable } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';

/**
 * Service handling business logic operations for checking, filtering, 
 * and retrieving customer ticket record datasets.
 */
@Injectable()
export class TicketsService {
  constructor(private readonly jsonStore: JsonStoreService) {}

  /**
   * Retrieves and filters all active ticket records belonging to a specific user.
   * 
   * @param userId - The unique identification string of the target user.
   * @returns An object containing the operation status, matching record count, and the filtered tickets array.
   */
  async findTicketsByUser(userId: string) {
    const allTickets = this.jsonStore.loadData('tickets');
    
    const userTickets = allTickets.filter(ticket => ticket.user_id === userId);
    
    return {
      success: true,
      count: userTickets.length,
      tickets: userTickets
    };
  }
}