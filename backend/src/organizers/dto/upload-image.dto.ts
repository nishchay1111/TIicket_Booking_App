import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  mimetype!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  @IsOptional()
  originalname?: string;

  @IsOptional()
  size?: number;
}