import { OrderStatus, PaymentStatus } from '../enums';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
