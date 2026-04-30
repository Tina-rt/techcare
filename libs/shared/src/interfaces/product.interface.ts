export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  brand: string;
  category: string[];
  serialNumber: string;
  characteristic: string;
  reduction: number;
  tva: number;
  active: boolean;
  image: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}
