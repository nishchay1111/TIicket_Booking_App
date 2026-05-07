import { IsInt, Min } from 'class-validator';

export class BookTicketDto {
  @IsInt()
  @Min(1, { message: 'Enter Number of Tickets you want to Reserve (min 1)' })
  numberOfTickets!: number;
}