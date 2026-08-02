import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object representing the payload required to authenticate a user.
 */
export class LoginDto {
  /**
   * The registered email address of the account attempting to log in.
   * Must conform to standard email formatting.
   */
  @IsEmail({}, { message: 'Enter a valid E-Mail' })
  email!: string;

  /**
   * The plain-text password provided for authentication.
   * Requirements: Must be a valid string with a minimum length of 6 characters.
   */
  @IsString()
  @MinLength(6, { message: 'Password cannot be blank' })
  password!: string;
}