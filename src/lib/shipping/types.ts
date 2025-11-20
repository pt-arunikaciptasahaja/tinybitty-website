export type ShippingAvailable = {
  available: true;
  price: number;
};

export type ShippingUnavailable = {
  available: false;
  reason: string;
};

export type ShippingResult = ShippingAvailable | ShippingUnavailable;

export interface ShippingRates {
  distance_km: number;
  gosend_instant: ShippingResult;
  gosend_same_day: ShippingResult;
  grabexpress_instant: ShippingResult;
  grabexpress_same_day: ShippingResult;
}

export interface GeocodeResult {
  lat: number;
  lon: number;
}

export interface OSRMRouteResponse {
  routes: Array<{
    distance: number;
    duration: number;
  }>;
}