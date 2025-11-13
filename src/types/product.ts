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
  address: string;
  deliveryMethod: 'gosend' | 'grab' | 'paxel' | 'pickup';
  paymentMethod: 'transfer' | 'cod' | 'ewallet';
  notes?: string;
}