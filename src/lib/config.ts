// config.ts

export interface LatLng {
  lat: number;
  lng: number;
}

// OpenRouteService API Configuration
export const ORS_CONFIG = {
  API_KEY: import.meta.env.VITE_ORS_API_KEY || 'YOUR_API_KEY_HERE',
  BASE_URL: 'https://api.openrouteservice.org/v2',
  // Free API key for testing (replace with your own at openrouteservice.org)
  FALLBACK_API_KEY: '5b3ce359785f0000000000000000000000000000000000000000'
};

// Fixed origin: your pickup point in DKI Jakarta
export const ORIGIN_COORD: LatLng = {
  lat: -6.3838528,
  lng: 106.8420638,
};

// Map of delivery service configurations
export const ONGKIR_SERVICE_CONFIG = {
  GOSEND_INSTANT: 'gosend',
  GOSEND_SAMEDAY: 'gosendsameday',
  GRAB_INSTANT: 'grab',
  GRAB_SAMEDAY: 'grab',
} as const;

// Map delivery method names from OrderForm to OngkirService
export const mapToOngkirService = (deliveryMethod: string): keyof typeof ONGKIR_SERVICE_CONFIG | null => {
  const serviceMap = {
    'gosend': 'GOSEND_INSTANT',
    'gosendsameday': 'GOSEND_SAMEDAY',
    'grab': 'GRAB_INSTANT',
    'paxel': null, // Not supported in ongkirHelpers
  } as const;

  return serviceMap[deliveryMethod] || null;
};