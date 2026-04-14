export interface ProductFilters {
  category?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
  isActive?: boolean;
}
