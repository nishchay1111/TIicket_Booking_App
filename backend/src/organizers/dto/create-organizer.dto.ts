import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object representing the payload required to register a new organizer account.
 */
export class CreateOrganizerDto {
  /**
   * The administrative name of the organizer or organization.
   * Requirements: Must be a string with a minimum length of 3 characters.
   */
  @IsString()
  @MinLength(3, { message: 'Enter a valid Name (min 3 characters)' })
  name!: string;

  /**
   * The primary contact email address for the organizer profile.
   * Must conform to standard email formatting.
   */
  @IsEmail({}, { message: 'Enter a valid E-Mail' })
  email!: string;

  /**
   * The plain-text password chosen by the organizer for profile security.
   * Requirements: Must be a string with a minimum length of 5 characters.
   */
  @IsString()
  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password!: string;
}