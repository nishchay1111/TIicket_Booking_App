import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Enter a valid E-Mail' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password cannot be blank' })
  password!: string;
}