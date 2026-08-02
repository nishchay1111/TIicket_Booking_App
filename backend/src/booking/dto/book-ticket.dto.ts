import { IsInt, Min } from 'class-validator';

/**
 * Data Transfer Object for validating ticket reservation requests.
 */
export class BookTicketDto {
  
  /**
   * The total number of tickets requested for reservation.
   * Must be a positive integer greater than or equal to 1.
   */
  @IsInt()
  @Min(1, { message: 'Enter Number of Tickets you want to Reserve (min 1)' })
  numberOfTickets!: number;
}