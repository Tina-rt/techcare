import { IsString, IsOptional, IsArray } from 'class-validator';

export class UploadFileDto {
  @IsString()
  filename: string;

  @IsString()
  @IsOptional()
  folder?: string;

  @IsString()
  @IsOptional()
  contentType?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
