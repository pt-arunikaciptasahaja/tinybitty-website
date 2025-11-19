// ongkirService.ts
import { calculateOngkir, OngkirService, ONGKIR_NOTE } from './ongkirHelpers';
import { haversineDistanceKm, LatLng } from './distanceHelpers';
import { ORIGIN_COORD, mapToOngkirService } from './config';
import { getCoordinatesForKelurahan, getCoordinatesForKecamatan } from './destinationCoords';
import { CartItem } from '../types/product';

export interface OngkirCalculationResult {
  distanceKm: number;
  result: {
    service: OngkirService;
    distanceKm: number;
    estimatedCost: number;
    currency: 'IDR';
    warnings: string[];
  };
  isValid: boolean;
  validationError?: string;
}

/**
 * Calculate ongkir for a destination coordinate
 */
function calculateOngkirForCoordinates(
  destination: LatLng,
  service: OngkirService
): OngkirCalculationResult {
  const distanceKm = haversineDistanceKm(ORIGIN_COORD, destination);
  const result = calculateOngkir(service, distanceKm);

  return {
    distanceKm,
    result,
    isValid: result.warnings.length === 0 || !result.warnings.includes('Unsupported service.')
  };
}

/**
 * Calculate ongkir using kelurahan coordinates
 */
export function calculateOngkirForKelurahan(
  kelurahanId: string,
  deliveryMethod: string
): OngkirCalculationResult {
  const ongkirService = mapToOngkirService(deliveryMethod);
  
  if (!ongkirService) {
    return {
      distanceKm: 0,
      result: {
        service: 'GOSEND_INSTANT',
        distanceKm: 0,
        estimatedCost: 0,
        currency: 'IDR',
        warnings: ['Unsupported delivery method']
      },
      isValid: false,
      validationError: 'Delivery method not supported for distance calculation'
    };
  }

  const coordinates = getCoordinatesForKelurahan(kelurahanId);
  
  if (!coordinates) {
    return {
      distanceKm: 0,
      result: {
        service: ongkirService,
        distanceKm: 0,
        estimatedCost: 0,
        currency: 'IDR',
        warnings: ['Coordinates not found for kelurahan']
      },
      isValid: false,
      validationError: 'Kelurahan coordinates not found'
    };
  }

  return calculateOngkirForCoordinates(coordinates, ongkirService);
}

/**
 * Calculate ongkir using kecamatan coordinates (fallback)
 */
export function calculateOngkirForKecamatan(
  kecamatanId: string,
  deliveryMethod: string
): OngkirCalculationResult {
  const ongkirService = mapToOngkirService(deliveryMethod);
  
  if (!ongkirService) {
    return {
      distanceKm: 0,
      result: {
        service: 'GOSEND_INSTANT',
        distanceKm: 0,
        estimatedCost: 0,
        currency: 'IDR',
        warnings: ['Unsupported delivery method']
      },
      isValid: false,
      validationError: 'Delivery method not supported for distance calculation'
    };
  }

  const coordinates = getCoordinatesForKecamatan(kecamatanId);
  
  if (!coordinates) {
    return {
      distanceKm: 0,
      result: {
        service: ongkirService,
        distanceKm: 0,
        estimatedCost: 0,
        currency: 'IDR',
        warnings: ['Coordinates not found for kecamatan']
      },
      isValid: false,
      validationError: 'Kecamatan coordinates not found'
    };
  }

  return calculateOngkirForCoordinates(coordinates, ongkirService);
}

/**
 * Main function to calculate ongkir with automatic fallback
 */
export function calculateOngkirForAddress(
  deliveryMethod: string,
  kelurahanId?: string,
  kecamatanId?: string
): OngkirCalculationResult {
  // Try kelurahan first if available
  if (kelurahanId) {
    const kelurahanResult = calculateOngkirForKelurahan(kelurahanId, deliveryMethod);
    if (kelurahanResult.isValid) {
      return kelurahanResult;
    }
  }

  // Fallback to kecamatan
  if (kecamatanId) {
    const kecamatanResult = calculateOngkirForKecamatan(kecamatanId, deliveryMethod);
    if (kecamatanResult.isValid) {
      return kecamatanResult;
    }
  }

  // Return invalid result if neither worked
  return {
    distanceKm: 0,
    result: {
      service: 'GOSEND_INSTANT',
      distanceKm: 0,
      estimatedCost: 0,
      currency: 'IDR',
      warnings: ['Unable to calculate distance for address']
    },
    isValid: false,
    validationError: 'Address coordinates not available'
  };
}

/**
 * Format cost for display
 */
export function formatOngkirCost(cost: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cost);
}

/**
 * Get delivery estimate time based on service
 */
export function getDeliveryEstimate(service: string): string {
  const estimates = {
    'GOSEND_INSTANT': '1-3 jam',
    'GOSEND_SAMEDAY': '3-6 jam',
    'GRAB_INSTANT': '1-4 jam',
    'GRAB_SAMEDAY': '3-6 jam',
  } as const;

  return estimates[service as keyof typeof estimates] || '1-3 jam';
}

/**
 * Convert OngkirCalculationResult to display format
 */
export function formatOngkirDisplay(result: OngkirCalculationResult) {
  return {
    cost: result.result.estimatedCost,
    zone: `${result.distanceKm.toFixed(1)} km`,
    time: getDeliveryEstimate(result.result.service),
    formattedCost: formatOngkirCost(result.result.estimatedCost),
    confidence: result.isValid ? 'Tinggi' : 'invalid',
    isValid: result.isValid,
    validationError: result.validationError,
    distanceKm: result.distanceKm,
    ongkirNote: ONGKIR_NOTE
  };
}