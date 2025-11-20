export interface ProductVariant {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  variants: ProductVariant[];
  isNew: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  variant: ProductVariant;
  quantity: number;
  image: string;
}

export interface OrderFormData {
  name: string;
  phone: string;
  // Legacy single address field for backward compatibility
  address?: string;
  // New structured address fields
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  detailedAddress?: string; // For street, building number, etc.
  deliveryMethod: 'gosend' | 'gosendsameday' | 'grab' | 'grabsameday' | 'paxel' | 'pickup';
  paymentMethod: 'transfer' | 'cod' | 'ewallet';
  notes?: string;
}