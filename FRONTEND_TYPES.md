# 📘 Frontend Types Documentation

This document defines the TypeScript types and interfaces for the Techcare frontend application to interact with the backend microservices.

---

## 🔐 Authentication

### `User`
The user profile object returned by `/auth/me`.
```typescript
interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN' | 'PHARMACIST';
  name?: string;
  firstname?: string;
  phone?: string;
}
```

### `SignInPayload`
```typescript
interface SignInPayload {
  email: string;
  password: string;
}
```

### `SignUpPayload`
```typescript
interface SignUpPayload {
  email: string;
  password: string;
  name?: string;
  firstname?: string;
  phone?: string;
}
```

---

## 📦 Products & Categories

### `Product`
```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
  brand: string;
  category: string[]; // List of Category IDs
  serialNumber: string;
  characteristic: string;
  reduction: number;
  tva: number;
  active: boolean;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}
```

### `Category`
```typescript
interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

### `ProductFilters`
Used for filtering the product list.
```typescript
interface ProductFilters {
  category?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  searchTerm?: string;
}
```

---

## 🛒 Cart

### `CartItem`
```typescript
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
```

### `Cart`
```typescript
interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
}
```

### `AddToCartDto`
```typescript
interface AddToCartDto {
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}
```

---

## 📋 Orders

### `Order`
```typescript
interface Order {
  _id: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'shipped' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: ShippingAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `ShippingAddress`
```typescript
interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}
```

### `CreateOrderDto`
```typescript
interface CreateOrderDto {
  userId: string;
  shippingAddress: ShippingAddress;
  notes?: string;
}
```

---

## 💳 Payment

### `CreatePaymentIntentDto`
```typescript
interface CreatePaymentIntentDto {
  orderId: string;
  amount: number;
  currency: string;
}
```

### `ConfirmPaymentDto`
```typescript
interface ConfirmPaymentDto {
  paymentIntentId: string;
  orderId: string;
}
```

---

## 📁 Files

### `FileResponse`
```typescript
interface FileResponse {
  id: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
  lastModified: string;
}
```

---

## 🔔 Notifications

### `Notification`
```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId?: string | number;
}
```

---

*Documentation generated from Backend DTOs and Schemas.*
