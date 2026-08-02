import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Data Transfer Object representing the metadata payload for an uploaded image resource.
 */
export class UploadImageDto {
  /**
   * The unique storage filename generated for the uploaded asset.
   */
  @IsString()
  @IsNotEmpty()
  filename!: string;

  /**
   * The standardized Multipurpose Internet Mail Extensions (MIME) type of the image.
   * Examples: 'image/jpeg', 'image/png', 'image/webp'.
   */
  @IsString()
  @IsNotEmpty()
  mimetype!: string;

  /**
   * The file system path or remote bucket URL location where the asset is stored.
   */
  @IsString()
  @IsNotEmpty()
  path!: string;

  /**
   * The original client-side filename of the uploaded file before processing.
   */
  @IsString()
  @IsOptional()
  originalname?: string;

  /**
   * The file size payload represented in bytes.
   */
  @IsOptional()
  size?: number;
}