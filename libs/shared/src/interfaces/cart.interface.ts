export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  reduction: number;
  name: string;
  image?: string;
}

export interface Cart {
  userId: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
