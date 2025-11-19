// config.ts

export interface LatLng {
  lat: number;
  lng: number;
}

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