import { Injectable } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategorieDocument = HydratedDocument<Categorie>;

@Schema()
export class Categorie {
  @Prop({ required: true })
  nom: string;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CategorieSchema = SchemaFactory.createForClass(Categorie);
