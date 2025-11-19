import {
  getDistanceKm,
  getOriginAddress,
  getGoSendInstantFee,
  getGoSendSameDayFee,
  getGrabExpressInstantFee
} from './distance';
import { ShippingRates, ShippingResult } from './types';

export async function calculateShipping(destination: string): Promise<ShippingRates> {
  // Get distance from fixed origin to destination using new API
  const distanceKm = await getDistanceKm(destination);

  // Handle case where OSRM fails (return null values)
  if (distanceKm === null) {
    return {
      distance_km: 0,
      gosend_instant: {
        available: false,
        reason: "Unable to calculate distance"
      },
      gosend_same_day: {
        available: false,
        reason: "Unable to calculate distance"
      },
      grabexpress_instant: {
        available: false,
        reason: "Unable to calculate distance"
      }
    };
  }

  // Calculate rates using the new delivery fee formulas
  const gosendInstant = {
    available: true as const,
    price: getGoSendInstantFee(distanceKm)
  };

  const gosendSameDay = {
    available: true as const,
    price: getGoSendSameDayFee(distanceKm)
  };

  const grabExpressInstant = {
    available: true as const,
    price: getGrabExpressInstantFee(distanceKm)
  };

  return {
    distance_km: distanceKm,
    gosend_instant: gosendInstant,
    gosend_same_day: gosendSameDay,
    grabexpress_instant: grabExpressInstant,
  };
}