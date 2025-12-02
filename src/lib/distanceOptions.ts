// distanceOptions.ts - Choose between straight-line vs road-based distance calculation

import { calculateDistanceKm, getOrigin } from './nominatimClient';
import { calculateRoadDistance } from './roadRouting';

export type DistanceCalculationMethod = 
  | 'straight-line'    // Fast Haversine calculation
  | 'road-based';      // Accurate OSRM road routing

/**
 * Calculate distance using the specified method
 */
export async function calculateDeliveryDistance(
  destination: { lat: number; lng: number },
  method: DistanceCalculationMethod = 'straight-line'
): Promise<number> {
  const origin = getOrigin();
  
  switch (method) {
    case 'straight-line':
      // Fast calculation - good for real-time UI updates
      return calculateDistanceKm(origin, destination);
      
    case 'road-based':
      // Accurate calculation - better for delivery cost estimates
      try {
        const roadDistance = await calculateRoadDistance(destination, {
          excludeTolls: true,      // Motorcycles prefer no toll roads
          fallbackToHaversine: true // Fallback if OSRM fails
        });
        return roadDistance || calculateDistanceKm(origin, destination);
      } catch (error) {
        console.warn('[DISTANCE] Road calculation failed, using straight-line:', error);
        return calculateDistanceKm(origin, destination);
      }
      
    default:
      return calculateDistanceKm(origin, destination);
  }
}

/**
 * Calculate delivery cost with chosen distance method
 */
export async function calculateDeliveryCostWithMethod(
  distanceKm: number,
  method: string,
  distanceCalculationMethod: DistanceCalculationMethod = 'straight-line'
): Promise<{
  cost: number;
  zone: { name: string };
  method: string;
  estimatedTime: string;
  distanceMethod: DistanceCalculationMethod;
  actualDistanceKm: number;
  isValidAddress: boolean;
}> {
  // Import delivery fee functions
  const {
    getGoSendInstantFee,
    getGoSendSameDayFee,
    getGrabExpressInstantFee,
    getGrabExpressSameDayFee
  } = await import('./shipping/deliveryFees');
  
  let selectedFee: number;
  let estimatedTime: string;
  let zoneName: string;
  
  switch (method) {
    case 'gosend':
    case 'gosendinstant':
      selectedFee = getGoSendInstantFee(distanceKm);
      estimatedTime = '1-3 jam';
      break;
    case 'gosendsameday':
      selectedFee = getGoSendSameDayFee(distanceKm);
      estimatedTime = '3-6 jam';
      break;
    case 'grab':
      selectedFee = getGrabExpressInstantFee(distanceKm);
      estimatedTime = '1-4 jam';
      break;
    case 'grabsameday':
      selectedFee = getGrabExpressSameDayFee(distanceKm);
      estimatedTime = '3-6 jam';
      break;
    case 'paxel':
      // Paxel uses GoSend Same Day pricing as reference
      selectedFee = getGoSendSameDayFee(distanceKm);
      estimatedTime = '2-6 jam';
      break;
    default:
      selectedFee = getGoSendInstantFee(distanceKm);
      estimatedTime = '1-3 jam';
  }
  
  // Check service availability
  const isServiceAvailable = selectedFee > 0;
  const isGoSendGrabMethod = method.includes('gosend') || method.includes('grab');
  
  if (isGoSendGrabMethod && distanceKm > 40) {
    return {
      cost: 0,
      zone: { name: 'Service unavailable - too far' },
      method,
      estimatedTime: 'N/A',
      distanceMethod: distanceCalculationMethod,
      actualDistanceKm: distanceKm,
      isValidAddress: false
    };
  }
  
  zoneName = `${distanceKm.toFixed(1)} km (${distanceCalculationMethod})`;
  
  return {
    cost: selectedFee,
    zone: { name: zoneName },
    method,
    estimatedTime,
    distanceMethod: distanceCalculationMethod,
    actualDistanceKm: distanceKm,
    isValidAddress: isServiceAvailable
  };
}

/**
 * Compare distance calculation methods for a destination
 */
export async function compareDistanceMethods(
  destination: { lat: number; lng: number }
): Promise<{
  straightLine: number;
  roadBased: number;
  difference: number;
  roadPercentageLonger: number;
}> {
  const [straightLine, roadBased] = await Promise.all([
    calculateDeliveryDistance(destination, 'straight-line'),
    calculateDeliveryDistance(destination, 'road-based')
  ]);
  
  const difference = roadBased - straightLine;
  const roadPercentageLonger = ((roadBased - straightLine) / straightLine) * 100;
  
  return {
    straightLine,
    roadBased,
    difference,
    roadPercentageLonger
  };
}