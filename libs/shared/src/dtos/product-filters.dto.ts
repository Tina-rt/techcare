import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class ProductFiltersDto {
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @Transform(({ value }: { value: unknown }): string[] => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as string[]) : [value];
      } catch {
        return [value];
      }
    }
    return value as string[];
  })
  category?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @Transform(({ value }: { value: unknown }): string[] => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as string[]) : [value];
      } catch {
        return [value];
      }
    }
    return value as string[];
  })
  categories?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDeleted?: boolean;
}
