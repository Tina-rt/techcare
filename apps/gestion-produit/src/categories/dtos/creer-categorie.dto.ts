import { IsNotEmpty, IsString } from 'class-validator';

export class CreerCategorieDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  description: string;
}
