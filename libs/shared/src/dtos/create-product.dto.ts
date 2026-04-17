import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString({
    message: 'Name should be a valid string',
  })
  @IsNotEmpty({ message: 'Product name is mandatory' })
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString({
    message: 'Description should be a valid string',
  })
  description: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;

  @IsString()
  brand: string;

  @IsArray()
  @IsMongoId({
    each: true,
    message: 'Every ID should be valid',
  })
  @Transform(({ value }: { value: unknown }): string[] => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        return Array.isArray(parsed) ? (parsed as string[]) : [value];
      } catch {
        return [value];
      }
    }
    return value as string[];
  })
  category: string[];

  @IsString()
  serialNumber: string;

  @IsString()
  characteristic: string;

  @IsNumber()
  @Type(() => Number)
  reduction: number;

  @IsNumber()
  @Type(() => Number)
  tva: number;

  @IsBoolean()
  @Type(() => Boolean)
  active: boolean;
}
