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

  @Transform(({ value }: { value: unknown }): unknown =>
    value !== undefined ? Number(value) : value,
  )
  @IsNumber()
  price: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown =>
    value !== undefined ? Number(value) : value,
  )
  @IsNumber()
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

  @Transform(({ value }: { value: unknown }): unknown =>
    value !== undefined ? Number(value) : value,
  )
  @IsNumber()
  reduction: number;

  @Transform(({ value }: { value: unknown }): unknown =>
    value !== undefined ? Number(value) : value,
  )
  @IsNumber()
  tva: number;

  @Transform(
    ({ value }: { value: unknown }): boolean =>
      value === 'true' || value === true,
  )
  @IsBoolean()
  active: boolean;
}
