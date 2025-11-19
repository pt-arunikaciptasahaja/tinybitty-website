// distanceDeliveryCalculator.ts
import { CartItem } from '../types/product';
import { calculateOngkirForAddress, formatOngkirDisplay } from './ongkirService';

/**
 * New distance-based delivery cost calculator to replace the old system
 */
export interface DeliveryCostResult {
  cost: number;
  zone: {
    name: string;
    code?: string;
  };
  estimatedTime: string;
  formattedCost: string;
  confidence: string;
  isValidAddress: boolean;
  distanceKm?: number;
  validationError?: string;
}

/**
 * Calculate delivery cost using distance-based system
 */
export function calculateDistanceDeliveryCost(
  fullAddress: string,
  deliveryMethod: string,
  cart: CartItem[],
  kelurahanId?: string,
  kecamatanId?: string
): DeliveryCostResult {
  try {
    const result = calculateOngkirForAddress(
      deliveryMethod,
      kelurahanId,
      kecamatanId
    );

    const formatted = formatOngkirDisplay(result);

    return {
      cost: result.result.estimatedCost,
      zone: {
        name: formatted.zone,
        code: result.result.service
      },
      estimatedTime: formatted.time,
      formattedCost: formatted.formattedCost,
      confidence: formatted.confidence,
      isValidAddress: result.isValid,
      distanceKm: result.distanceKm,
      validationError: result.validationError
    };
  } catch (error) {
    console.error('Distance delivery calculation error:', error);
    return {
      cost: 0,
      zone: { name: 'Error', code: 'ERROR' },
      estimatedTime: 'N/A',
      formattedCost: 'Calculation Error',
      confidence: 'invalid',
      isValidAddress: false,
      validationError: 'Unable to calculate delivery cost'
    };
  }
}

/**
 * Enhanced version that includes fallback logic
 */
export function calculateDeliveryCostWithFallback(
  fullAddress: string,
  deliveryMethod: string,
  cart: CartItem[],
  totalPrice: number,
  kelurahanId?: string,
  kecamatanId?: string
): DeliveryCostResult {
  // First try the new distance-based system
  const distanceResult = calculateDistanceDeliveryCost(
    fullAddress,
    deliveryMethod,
    cart,
    kelurahanId,
    kecamatanId
  );

  if (distanceResult.isValidAddress && distanceResult.cost > 0) {
    return distanceResult;
  }

  // Fallback to a simple estimation if distance calculation fails
  console.warn('Distance calculation failed, using fallback estimation');
  
  // Simple fallback pricing based on delivery method
  const fallbackPricing = {
    'gosend': { base: 13000, max: 35000 },
    'gosendsameday': { base: 12000, max: 30000 },
    'grab': { base: 15000, max: 40000 },
    'paxel': { base: 18000, max: 45000 }
  } as const;

  const pricing = fallbackPricing[deliveryMethod as keyof typeof fallbackPricing] || 
                  fallbackPricing['gosend'];

  const estimatedCost = Math.min(
    pricing.base + (totalPrice * 0.05), // 5% of cart value as service fee
    pricing.max
  );

  return {
    cost: Math.round(estimatedCost),
    zone: { name: 'Estimasi Area Jakarta', code: 'ESTIMATE' },
    estimatedTime: '1-3 jam',
    formattedCost: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(estimatedCost)),
    confidence: 'Sedang',
    isValidAddress: true,
    validationError: distanceResult.validationError
  };
}