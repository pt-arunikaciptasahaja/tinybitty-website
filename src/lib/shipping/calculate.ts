import {
  getOriginAddress,
  getGoSendInstantFee,
  getGoSendSameDayFee,
  getGrabExpressInstantFee,
  getGrabExpressSameDayFee
} from './deliveryFees';
import { searchLocations, calculateDistanceKm, getOrigin } from '../nominatimClient';
import { calculateRoadDistance } from '../roadRouting';
import { ShippingRates, ShippingResult } from './types';

export async function calculateShipping(destination: string): Promise<ShippingRates> {
  // Get distance from fixed origin to destination using new API
  const searchResults = await searchLocations(destination);
  if (searchResults.length === 0) {
    return {
      distance_km: 0,
      gosend_instant: {
        available: false,
        reason: "Address not found"
      },
      gosend_same_day: {
        available: false,
        reason: "Address not found"
      },
      grabexpress_instant: {
        available: false,
        reason: "Address not found"
      },
      grabexpress_same_day: {
        available: false,
        reason: "Address not found"
      }
    };
  }
  
  const origin = getOrigin();
  const distanceKm = calculateDistanceKm(origin, {
    lat: searchResults[0].lat,
    lng: searchResults[0].lng
  });

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
      },
      grabexpress_same_day: {
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

  const grabExpressSameDay = {
    available: true as const,
    price: getGrabExpressSameDayFee(distanceKm)
  };

  return {
    distance_km: distanceKm,
    gosend_instant: gosendInstant,
    gosend_same_day: gosendSameDay,
    grabexpress_instant: grabExpressInstant,
    grabexpress_same_day: grabExpressSameDay,
  };
}