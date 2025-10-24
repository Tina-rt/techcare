import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString({
    message: 'Le nom du produit doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom du produit est obligatoire.' })
  nom: string;

  @IsString({
    message: 'La description du produit doit être une chaîne de caractères.',
  })
  description: string;

  @IsNumber()
  prix: number;

  @IsNumber()
  quantite: number;

  @IsString()
  marque: string;

  @IsArray()
  @IsString({ each: true })
  categorie: string[]; // Array of category IDs

  @IsString()
  numeroSerie: string;

  @IsString()
  caracteristiques: string;

  @IsNumber()
  reduction: number;

  @IsNumber()
  tva: number;

  @IsBoolean()
  actif: boolean;
}
