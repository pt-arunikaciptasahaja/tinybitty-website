// Parser for delivery cost calculations
// Handles different scraper response formats and normalizes data

import { ScraperResult, DeliveryCalculation } from '../types';
import { calculateWeight } from '../types';

export interface ParseResult {
  price: number;
  eta: string;
  confidence: number; // 0-1, how confident we are in the price
  adjustments: {
    basePrice: number;
    weightCharge?: number;
    surcharge?: number;
    finalPrice: number;
  };
}

/**
 * Parse and normalize scraper results
 */
export class DeliveryParser {
  /**
   * Parse scraper result and apply business logic adjustments
   */
  static parseScraperResult(
    result: ScraperResult,
    address: string,
    cart: any[] = []
  ): ParseResult {
    const basePrice = result.price;
    let finalPrice = basePrice;
    let weightCharge = 0;
    let surcharge = 0;

    // Calculate weight from cart
    const totalWeight = calculateWeight(cart);
    
    // Apply weight surcharge for heavy packages
    if (totalWeight > 3) {
      weightCharge = (totalWeight - 3) * 15000; // Rp 15,000 per kg over 3kg
      finalPrice += weightCharge;
    }

    // Apply time-based surge (peak hours: 5-8 PM)
    const currentHour = new Date().getHours();
    if (currentHour >= 17 && currentHour <= 20) {
      surcharge = basePrice * 0.1; // 10% peak surcharge
      finalPrice += surcharge;
    }

    // Calculate confidence based on various factors
    const confidence = this.calculateConfidence(result, address, totalWeight);

    return {
      price: Math.round(finalPrice),
      eta: result.eta,
      confidence,
      adjustments: {
        basePrice,
        weightCharge: weightCharge > 0 ? weightCharge : undefined,
        surcharge: surcharge > 0 ? surcharge : undefined,
        finalPrice
      }
    };
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private static calculateConfidence(
    result: ScraperResult,
    address: string,
    weight: number
  ): number {
    let confidence = 0.8; // Base confidence for live data

    // Boost confidence if we have more data
    if (result.raw && typeof result.raw === 'object') {
      confidence += 0.1;
    }

    // Reduce confidence for very light or very heavy packages
    if (weight < 0.1) {
      confidence -= 0.2; // Suspiciously light
    } else if (weight > 10) {
      confidence -= 0.1; // Very heavy package
    }

    // Adjust based on price reasonableness
    const price = result.price;
    if (price < 5000 || price > 200000) {
      confidence -= 0.3; // Unreasonable price
    }

    // Provider-specific confidence adjustments
    switch (result.provider) {
      case 'gosend':
        confidence += 0.05; // Generally reliable
        break;
      case 'grab':
        confidence += 0.03; // Good reliability
        break;
      case 'paxel':
        confidence += 0.02; // Slightly less reliable
        break;
    }

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * Validate parsed result for reasonableness
   */
  static validateResult(parseResult: ParseResult, address: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check price reasonableness
    if (parseResult.price < 5000) {
      issues.push('Price too low');
    }
    if (parseResult.price > 500000) {
      issues.push('Price too high');
    }

    // Check ETA reasonableness
    if (!parseResult.eta || parseResult.eta.length === 0) {
      issues.push('Missing ETA');
    }

    // Check confidence
    if (parseResult.confidence < 0.3) {
      issues.push('Low confidence score');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Format result for display
   */
  static formatDisplay(parseResult: ParseResult, provider: string): {
    priceFormatted: string;
    etaFormatted: string;
    confidenceFormatted: string;
    breakdownFormatted: string;
  } {
    const priceFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseResult.price);

    const confidenceFormatted = `${Math.round(parseResult.confidence * 100)}%`;
    
    const breakdownParts = [
      `Base: ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(parseResult.adjustments.basePrice)}`
    ];

    if (parseResult.adjustments.weightCharge) {
      breakdownParts.push(`Weight: +${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(parseResult.adjustments.weightCharge)}`);
    }

    if (parseResult.adjustments.surcharge) {
      breakdownParts.push(`Peak: +${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(parseResult.adjustments.surcharge)}`);
    }

    return {
      priceFormatted,
      etaFormatted: parseResult.eta,
      confidenceFormatted,
      breakdownFormatted: breakdownParts.join(' + ')
    };
  }

  /**
   * Calculate price range for comparison
   */
  static calculatePriceRange(parseResult: ParseResult): {
    min: number;
    max: number;
    confidence: 'high' | 'medium' | 'low';
  } {
    const { price, confidence } = parseResult;
    let range: { min: number; max: number };

    if (confidence >= 0.8) {
      range = { min: price * 0.95, max: price * 1.05 };
    } else if (confidence >= 0.6) {
      range = { min: price * 0.85, max: price * 1.15 };
    } else {
      range = { min: price * 0.7, max: price * 1.3 };
    }

    let confidenceLevel: 'high' | 'medium' | 'low';
    if (confidence >= 0.8) {
      confidenceLevel = 'high';
    } else if (confidence >= 0.5) {
      confidenceLevel = 'medium';
    } else {
      confidenceLevel = 'low';
    }

    return {
      min: Math.round(range.min),
      max: Math.round(range.max),
      confidence: confidenceLevel
    };
  }
}