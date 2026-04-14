import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Model, FilterQuery } from 'mongoose';
import { ProductFilters } from '@app/shared';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  brand: string;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [], index: true })
  category: Types.ObjectId[];

  @Prop({ unique: true, required: true })
  serialNumber: string;

  @Prop()
  characteristic: string;

  @Prop()
  reduction: number;

  @Prop()
  tva: number;

  @Prop()
  active: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  characteristic: 'text',
});
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });

interface ProductModel extends Model<ProductDocument> {
  search(query: string, filters?: ProductFilters): Promise<ProductDocument[]>;
}

ProductSchema.statics.search = function (
  query: string,
  filters: ProductFilters = {},
) {
  const searchQuery: FilterQuery<ProductDocument> = {};
  if (query) {
    searchQuery.$text = { $search: query };
  }
  if (filters.categories && filters.categories.length > 0) {
    searchQuery.category = { $in: filters.categories };
  }
  if (filters.minPrice) {
    searchQuery.price = { ...searchQuery.price, $gte: filters.minPrice };
  }
  if (filters.maxPrice) {
    searchQuery.price = { ...searchQuery.price, $lte: filters.maxPrice };
  }

  if (filters.isActive !== undefined) {
    searchQuery.active = filters.isActive;
  }

  return this.find(searchQuery);
};
