export interface ProductFilters {
  categorie?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
  isActive?: boolean;
}
