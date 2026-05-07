import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { BookTicketDto } from './dto/book-ticket.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingService {
  constructor(private readonly jsonStore: JsonStoreService) {}

  async fetchAllTickets(userId: string) {
    const tickets = this.jsonStore.loadData('tickets');
    const userTickets = tickets.filter((t) => t.user_id === userId);
    return { 
      success: userTickets.length > 0, 
      userTickets,
      message: userTickets.length === 0 ? "No tickets found" : undefined 
    };
  }

  async fetchAllEvents() {
    return this.jsonStore.loadData('events');
  }

  async bookTicket(showId: string, bookTicketDto: BookTicketDto, user: any) {
    const { numberOfTickets } = bookTicketDto;
    const events = this.jsonStore.loadData('events');

    // 1. Find Event and Show
    const event = events.find((e) => e.show_dates.some((s) => s.show_id === showId));
    if (!event) throw new NotFoundException('Show does not exist');

    const selectedShow = event.show_dates.find((s) => s.show_id === showId);

    // 2. Availability Check
    if (numberOfTickets > selectedShow.available_tickets) {
      throw new BadRequestException('Not Enough Tickets');
    }

    // 3. Update & Save Events
    selectedShow.available_tickets -= numberOfTickets;
    this.jsonStore.saveData('events', events);

    // 4. Create & Save Ticket
    const newTicket = {
      ticket_id: uuidv4(),
      user_id: user.id,
      user_email: user.user_email,
      event_id: event.event_id,
      event_name: event.event_name,
      show_id: selectedShow.show_id,
      show_date: selectedShow.show_date,
      event_location: event.event_location,
      image_url: event.image_url,
      number_of_tickets: numberOfTickets,
      total_price: numberOfTickets * selectedShow.ticket_price,
      date_booked: new Date().toISOString(),
    };

    const tickets = this.jsonStore.loadData('tickets');
    tickets.push(newTicket);
    this.jsonStore.saveData('tickets', tickets);

    return { success: true, message: 'Ticket booked successfully', ticket: newTicket };
  }

  async deleteTicket(ticketId: string, userId: string) {
    const tickets = this.jsonStore.loadData('tickets');
    const events = this.jsonStore.loadData('events');

    const ticketIndex = tickets.findIndex((t) => t.ticket_id === ticketId);
    if (ticketIndex === -1) throw new NotFoundException('Ticket Not Found');

    if (tickets[ticketIndex].user_id !== userId) {
      throw new UnauthorizedException('Not Allowed!');
    }

    const ticket = tickets[ticketIndex];

    // Restore Seats
    const event = events.find((e) => e.show_dates.some((s) => s.show_id === ticket.show_id));
    if (event) {
      const show = event.show_dates.find((s) => s.show_id === ticket.show_id);
      show.available_tickets += ticket.number_of_tickets;
      this.jsonStore.saveData('events', events);
    }

    const updatedTickets = tickets.filter((t) => t.ticket_id !== ticketId);
    this.jsonStore.saveData('tickets', updatedTickets);

    return { success: true, message: 'Ticket deleted and seats restored', ticket };
  }
}