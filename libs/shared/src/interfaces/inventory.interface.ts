import { Product } from './product.interface';
import { StockMovementType } from '../enums/inventory.enum';

export interface Inventory {
  id?: number;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  location?: string | null;
  lastUpdated?: Date | string;
}

export interface InventoryWithProduct extends Inventory {
  product: Product | null;
}

export interface UpdateStockDto {
  productId: string;
  quantity: number;
}

export interface StockReservationDto {
  orderId: string;
  items: { productId: string; quantity: number }[];
  userId: string;
}

export interface StockReleaseDto {
  items: { productId: string; quantity: number }[];
}

export interface StockMovement {
  id?: number;
  productId: string;
  type: StockMovementType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string | null;
  reason?: string | null;
  createdAt?: Date | string;
}

export interface StockMovementWithProduct extends StockMovement {
  product: Product | null;
}
