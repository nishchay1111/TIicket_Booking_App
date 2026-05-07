import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string; // Added '!'

  @IsEmail({}, { message: 'Enter a valid E-Mail' })
  email!: string; // Added '!'

  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password!: string; // Added '!'
}