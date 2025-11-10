import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { isArrayBuffer } from 'util/types';

export class CreateProductDto {
  @IsString({
    message: 'Le name du produit doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le name du produit est obligatoire.' })
  name: string;

  // @IsString({
  //   message: "l'Image est obligatoire",
  // })
  // imageUrl?: string;

  @IsString({
    message: 'La description du produit doit être une chaîne de caractères.',
  })
  description: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsString()
  brand: string;

  @IsArray()
  @IsMongoId({
    each: true,
    message: 'Chaque ID de catégorie doit être valide.',
  })
  @Transform(({ value }) => {
    console.log('Transform value:', value);
    if (Array.isArray(value)) return value;
    // If it's a string, parse it
    if (typeof value === 'string') {
      console.log('Parsing string to array:', value);
      try {
        const newval = JSON.parse(value);
        console.log('Parsed value:', newval, 'type:', typeof newval);
        return Array.from(newval);
      } catch (e) {
        console.log('Error parsing string to array:', e);
        return [value]; // If parsing fails, wrap it in an array
      }
    }
    return value;
  })
  category: string[]; // Array of category IDs

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
