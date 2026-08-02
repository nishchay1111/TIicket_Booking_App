import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object representing the payload required to register a new user account.
 */
export class CreateUserDto {
  /**
   * The full name of the user.
   * @example "John Doe"
   */
  @IsString()
  name!: string; 

  /**
   * The unique email address used for account identity and communication.
   * Must conform to standard email formatting.
   */
  @IsEmail({}, { message: 'Enter a valid E-Mail' })
  email!: string;

  /**
   * The plain-text password chosen by the user.
   * Requirements: Minimum length of 5 characters.
   */
  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password!: string;
}