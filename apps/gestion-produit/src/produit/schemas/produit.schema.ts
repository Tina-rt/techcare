import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProduitDocument = HydratedDocument<Produit>;

@Schema()
export class Produit {
  @Prop({ required: true })
  nom: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  prix: number;

  @Prop({ required: true })
  quantite: number;

  @Prop()
  marque: string;

  @Prop({ type: [Types.ObjectId], ref: 'Categorie', default: [], index: true })
  categorie: Types.ObjectId[];

  @Prop()
  numeroSerie: string;

  @Prop()
  caracteristiques: string;

  @Prop()
  reduction: number;

  @Prop()
  tva: number;

  @Prop()
  actif: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProduitSchema = SchemaFactory.createForClass(Produit);

ProduitSchema.index({
  nom: 'text',
  description: 'text',
  marque: 'text',
  caracteristiques: 'text',
});
ProduitSchema.index({ prix: 1 });
ProduitSchema.index({ categorie: 1 });

ProduitSchema.statics.search = function (query: string, filters: any = {}) {
  const searchQuery: any = {};
  if (query) {
    searchQuery.$text = { $search: query };
  }
  if (filters.categorie && filters.categorie.length > 0) {
    searchQuery.categorie = { $in: filters.categorie };
  }
  if (filters.minPrice) {
    searchQuery.prix = { ...searchQuery.prix, $gte: filters.minPrice };
  }
  if (filters.maxPrice) {
    searchQuery.prix = { ...searchQuery.prix, $lte: filters.maxPrice };
  }

  if (filters.isActive !== undefined) {
    searchQuery.actif = filters.isActive;
  }

  return this.find(searchQuery);
};
