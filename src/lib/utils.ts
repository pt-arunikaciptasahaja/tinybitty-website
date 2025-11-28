import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans up address string by removing redundant "Jawa, Indonesia" suffix
 * Example: "12920, Setiabudi, Jakarta Selatan, Daerah Khusus Ibukota Jakarta, Jawa, Indonesia"
 * becomes: "12920, Setiabudi, Jakarta Selatan, Daerah Khusus Ibukota Jakarta"
 */
export function cleanAddress(address: string): string {
  if (!address) return '';
  
  // Remove common redundant suffixes
  return address
    .replace(/\s*,\s*Jawa\s*,\s*Indonesia\s*$/i, '') // Remove ", Jawa, Indonesia" at the end
    .replace(/\s*,\s*Jawa\s*$/i, '') // Remove ", Jawa" at the end  
    .replace(/\s*,\s*Indonesia\s*$/i, '') // Remove ", Indonesia" at the end
    .replace(/\s*Jawa\s*,\s*Indonesia\s*$/i, '') // Remove "Jawa, Indonesia" at the end
    .trim()
    .replace(/,\s*$/, ''); // Remove trailing comma
}
