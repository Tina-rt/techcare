import { OrderItem } from '../interfaces/order.interface';

/**
 * Payload emitted when stock is successfully reserved.
 * Used by PAYMENT_MANAGER listening to 'stock_reserved' event.
 */
export interface StockReservedPayload {
  orderId: string;
  items: OrderItem[];
  userId: string;
}

/**
 * Payload for saga failures (stock / product validation failed).
 */
export interface SagaFailurePayload {
  orderId: string;
  reason?: string;
}

/**
 * Payload for finalizing stock after a completed payment.
 */
export interface FinalizeStockPayload {
  orderId: string;
  items: OrderItem[];
}

/**
 * JWT token payload decoded from the auth bearer token.
 */
export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * The user object stored on the request by Passport after JWT validation.
 */
export interface AuthenticatedUser {
  userId: number;
  email: string;
}

/**
 * Response shape for the notification realtime gateway.
 */
export interface NotificationPayload {
  userId?: string | number;
  title?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * Dashboard statistics response aggregated across microservices.
 */
export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardStats {
  totalRevenue: number;
  totalProductsOrdered: number;
  orders: unknown[];
  salesAmountGraph: ChartData;
  orderedProductGraph: ChartData;
}

/**
 * Profile update payload used in auth service.
 */
export interface UpdateProfileData {
  name?: string;
  firstname?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
}
