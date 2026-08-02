import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { v4 as uuidv4 } from 'uuid';
import type { BookTicketDto } from './dto/book-ticket.dto';

/**
 * Service managing core business logic for processing ticketing queries, 
 * auditing inventory allocations, executing reservations, and handling cancellations.
 */
@Injectable()
export class BookingService {
  constructor(private readonly jsonStore: JsonStoreService) { }

  /**
   * Retrieves all ticket transactions matching a specific user context.
   * @param userId - The target identifier used to filter the ticketing collection.
   * @returns An object containing the lookup result status and matching tickets collection.
   */
  async fetchAllTickets(userId: string) {
    const tickets = this.jsonStore.loadData('tickets');
    const userTickets = tickets.filter((t) => t.user_id === userId);
    return {
      success: userTickets.length > 0,
      userTickets,
      message: userTickets.length === 0 ? 'No tickets found' : undefined,
    };
  }

  /**
   * Fetches the comprehensive list of all scheduled events from local file persistence.
   * @returns An array containing all active event records.
   */
  async fetchAllEvents() {
    return this.jsonStore.loadData('events');
  }

  /**
   * Evaluates seating availability, deducts allocation quotas, and registers a transaction ledger.
   * @param showId - The specific show runtime boundary reference identifier.
   * @param bookTicketDto - The target seat quantity validation payload.
   * @param user - The identity object representing the purchasing customer.
   * @returns The transaction completion confirmation details wrapping the new ticket instance.
   */
  async bookTicket(showId: string, bookTicketDto: BookTicketDto, user: any) {
    const { numberOfTickets } = bookTicketDto;
    const events = this.jsonStore.loadData('events');

    const event = events.find((e) =>
      e.shows.some((s) => s.show_id === showId)
    );
    if (!event) throw new NotFoundException('Show does not exist');

    const selectedShow = event.shows.find((s) => s.show_id === showId);

    if (numberOfTickets > selectedShow.available_tickets) {
      throw new BadRequestException('Not Enough Tickets');
    }

    selectedShow.available_tickets -= numberOfTickets;
    this.jsonStore.saveData('events', events);

    const newTicket = {
      ticket_id: uuidv4(),
      user_id: user.id,
      user_email: user.email || user.user_email,
      event_id: event.event_id,
      event_name: event.event_name,
      show_id: selectedShow.show_id,
      show_date: selectedShow.show_date,
      show_time: selectedShow.show_time || '',
      venue_name: selectedShow.venue_name || '',
      venue_address: selectedShow.venue_address || null,
      image_url: event.image_url || null,
      number_of_tickets: numberOfTickets,
      total_price: numberOfTickets * (selectedShow.ticket_price || 0),
      date_booked: new Date().toISOString(),
    };

    const tickets = this.jsonStore.loadData('tickets');
    tickets.push(newTicket);
    this.jsonStore.saveData('tickets', tickets);

    return {
      success: true,
      message: 'Ticket booked successfully',
      ticket: newTicket,
    };
  }

  /**
   * Looks up complete structural info for a single event profile configuration.
   * @param eventId - The unique root key identifier matching the target event.
   * @returns The complete matched event entity payload metadata.
   */
  async fetchEventById(eventId: string) {
    const events = this.jsonStore.loadData('events');
    const event = events.find((e) => e.event_id === eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  /**
   * Invalidates a previous ticket reservation ledger mapping and returns quantities to the event pool.
   * @param ticketId - The specific identity sequence representing the booked ticket.
   * @param userId - The verification identifier ensuring requesting agent authority.
   * @returns The removal summary state containing the deleted transaction footprint.
   */
  async deleteTicket(ticketId: string, userId: string) {
    const tickets = this.jsonStore.loadData('tickets');
    const events = this.jsonStore.loadData('events');

    const ticketIndex = tickets.findIndex((t) => t.ticket_id === ticketId);
    if (ticketIndex === -1) throw new NotFoundException('Ticket Not Found');

    if (tickets[ticketIndex].user_id !== userId) {
      throw new UnauthorizedException('You do not own this ticket!');
    }

    const ticket = tickets[ticketIndex];

    const event = events.find((e) =>
      e.shows.some((s) => s.show_id === ticket.show_id)
    );

    if (event) {
      const show = event.shows.find((s) => s.show_id === ticket.show_id);
      if (show) {
        show.available_tickets += ticket.number_of_tickets;
        this.jsonStore.saveData('events', events);
      }
    }

    const updatedTickets = tickets.filter((t) => t.ticket_id !== ticketId);
    this.jsonStore.saveData('tickets', updatedTickets);

    return {
      success: true,
      message: 'Ticket deleted and seats restored',
      ticket,
    };
  }
}