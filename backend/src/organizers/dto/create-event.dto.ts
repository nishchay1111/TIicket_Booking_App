import { IsString, IsArray, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  totalTickets!: string | number;

  @IsNotEmpty()
  price!: string | number;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Enter an Event Name' })
  event_name!: string;           // 👈 renamed from eventName

  @IsString()
  @IsOptional()
  event_description?: string;    // 👈 renamed from eventDescription

  @IsString()
  @IsOptional()
  event_city?: string;           // 👈 renamed from eventCity

  @IsString()
  @IsOptional()
  event_location?: string;       // 👈 renamed from eventAddress

  @IsString()
  @IsOptional()
  event_category?: string;       // 👈 renamed from eventCategory

  @IsString()
  @IsOptional()
  event_genre?: string;          // 👈 renamed from eventGener

  @IsString()
  @IsOptional()
  image_url?: string;            // 👈 renamed from imageAddress

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShowDateDto)
  show_dates?: ShowDateDto[];
}