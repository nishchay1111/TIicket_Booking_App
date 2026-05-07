import { IsString, IsArray, IsNotEmpty, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Sub-DTO for the show_dates array objects
export class ShowDateDto {
  @IsString()
  @IsNotEmpty()
  show_date!: string;

  @IsString()
  @IsNotEmpty()
  show_time!: string;

  @IsString()
  @IsNotEmpty()
  show_language!: string;

  @IsNotEmpty()
  totalTickets!: string | number; // Handling both since your logic uses parseInt

  @IsNotEmpty()
  price!: string | number; // Handling both since your logic uses parseFloat
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Enter an Event Name' })
  eventName!: string;

  @IsString()
  eventDescription!: string;

  @IsString()
  eventCity!: string;

  @IsString()
  eventAddress!: string;

  @IsString()
  eventCategory!: string;

  @IsString()
  eventGener!: string;

  @IsString()
  imageAddress!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShowDateDto)
  show_dates!: ShowDateDto[];
}