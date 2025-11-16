// Types for the delivery cost engine

export interface DeliveryZone {
  name: string;
  cities: string[];
  districts: string[];
  postalCodes?: string[];
  baseRates: {
    gosendInstant: number;
    grab: number;
    paxel: number;
  };
  distance: 'near' | 'medium' | 'far';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CartItem {
  productName: string;
  quantity: number;
  variant: {
    size: string;
    price: number;
  };
}

export interface ScraperResult {
  price: number;
  eta: string;
  provider: 'gosend' | 'grab' | 'paxel';
  raw?: any;
  isLive: boolean;
}

export interface DeliveryCalculation {
  cost: number;
  provider: 'gosend' | 'grab' | 'paxel';
  zone: DeliveryZone;
  isLive: boolean;      // true = from scraper
  estimated: boolean;   // true = fallback
  breakdown: {
    baseRate: number;
    distanceMultiplier: number;
    weightCharge: number;
    surcharges?: number;
  };
}

// Extended result with metadata
export interface DeliveryResult extends DeliveryCalculation {
  address: string;
  timestamp: Date;
  source: 'live' | 'fallback' | 'estimate';
  confidence?: number;
}

export interface ScrapingError extends Error {
  provider: string;
  address: string;
  timestamp: Date;
  originalError?: Error;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  provider: 'gosend' | 'grab' | 'paxel';
  type: 'instant' | 'same_day' | 'regular';
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'gosendInstant',
    name: 'GoSend Instant',
    provider: 'gosend',
    type: 'instant'
  },
  {
    id: 'gosendSameDay',
    name: 'GoSend Same Day',
    provider: 'gosend',
    type: 'same_day'
  },
  {
    id: 'grabExpress',
    name: 'GrabExpress Instant',
    provider: 'grab',
    type: 'instant'
  },
  {
    id: 'paxel',
    name: 'Paxel',
    provider: 'paxel',
    type: 'regular'
  }
];

// Weight calculation utilities
export const WEIGHT_PER_SIZE = {
  small: 0.15,    // 150g
  medium: 0.25,   // 250g
  large: 0.35,    // 350g
  family: 0.5     // 500g
};

export const calculateWeight = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => {
    const itemWeight = WEIGHT_PER_SIZE[item.variant.size.toLowerCase() as keyof typeof WEIGHT_PER_SIZE] || 0.2;
    return total + (itemWeight * item.quantity);
  }, 0);
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Store pickup location
export const STORE_LOCATION = {
  name: 'Tiny Bitty Store',
  address: 'Depok, Sukmajaya, 16411',
  coordinates: {
    lat: -6.3870,
    lng: 106.8320
  }
};