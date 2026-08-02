import { IsString, IsArray, IsNotEmpty, IsOptional, ValidateNested, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object representing the geographic address parameters for a specific show venue.
 */
export class VenueAddressDto {
  /**
   * The street address of the venue.
   */
  @IsString()
  @IsOptional()
  street?: string;

  /**
   * The city where the venue is located.
   */
  @IsString()
  @IsOptional()
  city?: string;

  /**
   * The state or region where the venue is located.
   */
  @IsString()
  @IsOptional()
  state?: string;

  /**
   * The postal or ZIP code for the venue location.
   */
  @IsString()
  @IsOptional()
  zip?: string;
}

/**
 * Data Transfer Object representing the configuration details, structural logistics, 
 * and ticketing inventory constraints for an individual show instance.
 */
export class ShowDto {
  /**
   * The unique system identifier for the show. 
   * Generated automatically by the backend architecture if omitted during creation.
   */
  @IsString()
  @IsOptional()
  show_id?: string;

  /**
   * The explicit structural name of the hosting facility or venue.
   */
  @IsString()
  @IsNotEmpty()
  venue_name!: string;

  /**
   * The detailed address configuration parameters matching the hosting venue.
   */
  @ValidateNested()
  @Type(() => VenueAddressDto)
  @IsOptional()
  venue_address?: VenueAddressDto;

  /**
   * The scheduled calendar date text for the show execution.
   */
  @IsString()
  @IsNotEmpty()
  show_date!: string;

  /**
   * The specific chronological time text boundary for the show performance.
   */
  @IsString()
  @IsNotEmpty()
  show_time!: string;

  /**
   * The specific auditorium, theater hall, or screen allocation descriptor within the venue.
   */
  @IsString()
  @IsOptional()
  screen?: string;

  /**
   * The spoken or subtitled language medium assigned to the show performance execution.
   */
  @IsString()
  @IsNotEmpty()
  show_language!: string;

  /**
   * The total maximum structural seating capacity allocated for the initial pool configuration.
   */
  @IsNotEmpty()
  total_tickets!: string | number;

  /**
   * The remaining real-time unreserved seating pool capacity. 
   * System defaults dynamically to the total_tickets parameter configuration value if omitted.
   */
  @IsOptional()
  available_tickets?: string | number;

  /**
   * The standard individual nominal currency unit base price assigned to a single ticket reservation.
   */
  @IsNotEmpty()
  ticket_price!: string | number;

  /**
   * Flags whether the specific show runtime boundary is active and available for customer reservations.
   * System defaults to true if omitted.
   */
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

/**
 * Data Transfer Object representing the comprehensive payload schema required to register 
 * a new root parent event complete with nested individual runtime show mappings.
 */
export class CreateEventDto {
  /**
   * The primary administrative display name designated for the event profile.
   */
  @IsString()
  @IsNotEmpty({ message: 'Enter an Event Name' })
  event_name!: string;

  /**
   * An optional contextual overview summarizing the event contents or logistical notes.
   */
  @IsString()
  @IsOptional()
  event_description?: string;

  /**
   * The high-level thematic categorization profile classification mapping for the event.
   */
  @IsString()
  @IsOptional()
  event_category?: string;

  /**
   * The artistic genre taxonomy tag matching the event data layer.
   * Note: Property key preserves historical data layout naming configurations.
   */
  @IsString()
  @IsOptional()
  event_gener?: string;

  /**
   * The remote web resource locator path reference hosting the promotional image media asset.
   */
  @IsString()
  @IsOptional()
  image_url?: string;

  /**
   * A structural collection array containing distinct individual show schedule configurations.
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShowDto)
  shows?: ShowDto[];
}