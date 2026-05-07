import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateOrganizerDto {
  @IsString()
  @MinLength(3, { message: 'Enter a valid Name (min 3 characters)' })
  name!: string;

  @IsEmail({}, { message: 'Enter a valid E-Mail' })
  email!: string;

  @IsString()
  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password!: string;
}