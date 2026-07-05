// Supabase DB row types for the admin dashboard feature

export interface ProductVariantDB {
  size: string;
  price: number;
}

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  category: 'cookies' | 'juice';
  image: string;
  variants: ProductVariantDB[];
  ingredients: string[];
  toppings: string[];
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export interface HamperVariantDB {
  name: string;
  price: number;
}

export interface HamperRow {
  id: string;
  name: string;
  description: string;
  image: string;
  images: string[];
  price: number | null;
  hamper_variants: HamperVariantDB[];
  rating: number;
  sales: string;
  seasonal: string;
  whats_included: string[];
  created_at: string;
  updated_at: string;
}
