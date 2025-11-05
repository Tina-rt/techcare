import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString({
    message: 'Le name du produit doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le name du produit est obligatoire.' })
  name: string;

  @IsString({
    message: 'La description du produit doit être une chaîne de caractères.',
  })
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsString()
  brand: string;

  @IsArray()
  @IsString({ each: true })
  category: string[]; // Array of category IDs

  @IsString()
  serialNumber: string;

  @IsString()
  characteristic: string;

  @IsNumber()
  reduction: number;

  @IsNumber()
  tva: number;

  @IsBoolean()
  active: boolean;
}
