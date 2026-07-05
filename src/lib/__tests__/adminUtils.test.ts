import { describe, it, expect } from 'vitest';
import {
  isAdminEmail,
  validateImageFile,
  toProductFormValues,
  toProductRow,
  toHamperFormValues,
  toHamperRow,
} from '../adminUtils';
import type { ProductRow, HamperRow } from '@/types/supabase-models';

// -----------------------------------------------
// isAdminEmail
// -----------------------------------------------
describe('isAdminEmail', () => {
  it('returns true for the known admin email', () => {
    expect(isAdminEmail('admin@tinybitty.com')).toBe(true);
  });

  it('returns false for an unknown email', () => {
    expect(isAdminEmail('random@example.com')).toBe(false);
  });

  it('is case-sensitive — different casing returns false', () => {
    expect(isAdminEmail('Admin@TinyBitty.com')).toBe(false);
    expect(isAdminEmail('ADMIN@TINYBITTY.COM')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAdminEmail('')).toBe(false);
  });
});

// -----------------------------------------------
// validateImageFile
// -----------------------------------------------
const MB = 1024 * 1024;

describe('validateImageFile', () => {
  it('accepts image/jpeg', () => {
    expect(validateImageFile({ type: 'image/jpeg', size: 1 * MB, name: 'photo.jpg' }).isValid).toBe(true);
  });

  it('accepts image/png', () => {
    expect(validateImageFile({ type: 'image/png', size: 1 * MB, name: 'photo.png' }).isValid).toBe(true);
  });

  it('accepts image/webp', () => {
    expect(validateImageFile({ type: 'image/webp', size: 1 * MB, name: 'photo.webp' }).isValid).toBe(true);
  });

  it('rejects image/gif', () => {
    const result = validateImageFile({ type: 'image/gif', size: 1 * MB, name: 'anim.gif' });
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects application/pdf', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 1 * MB, name: 'doc.pdf' }).isValid).toBe(false);
  });

  it('accepts file at exactly 5 MB', () => {
    expect(validateImageFile({ type: 'image/jpeg', size: 5 * MB, name: 'big.jpg' }).isValid).toBe(true);
  });

  it('rejects file at 5 MB + 1 byte', () => {
    const result = validateImageFile({ type: 'image/jpeg', size: 5 * MB + 1, name: 'toobig.jpg' });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/5 MB/i);
  });

  it('rejects wrong extension even with valid MIME', () => {
    const result = validateImageFile({ type: 'image/jpeg', size: 1 * MB, name: 'disguised.exe' });
    expect(result.isValid).toBe(false);
  });
});

// -----------------------------------------------
// Product serialization round-trip
// -----------------------------------------------
const sampleProductRow: ProductRow = {
  id: 'golden-crunch',
  name: 'Golden Crunch',
  description: 'A delightful blend.',
  category: 'cookies',
  image: 'https://example.com/img.png',
  variants: [
    { size: 'Large 400gr', price: 220000 },
    { size: 'Mini 30gr', price: 20000 },
  ],
  ingredients: ['Flour', 'Eggs', 'Australian Butter'],
  toppings: [],
  is_new: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('toProductFormValues / toProductRow round-trip', () => {
  it('converts to form values and back without data loss', () => {
    const formValues = toProductFormValues(sampleProductRow);
    const roundTripped = toProductRow(formValues);

    expect(roundTripped.id).toBe(sampleProductRow.id);
    expect(roundTripped.name).toBe(sampleProductRow.name);
    expect(roundTripped.description).toBe(sampleProductRow.description);
    expect(roundTripped.category).toBe(sampleProductRow.category);
    expect(roundTripped.image).toBe(sampleProductRow.image);
    expect(roundTripped.variants).toEqual(sampleProductRow.variants);
    expect(roundTripped.ingredients).toEqual(sampleProductRow.ingredients);
    expect(roundTripped.toppings).toEqual(sampleProductRow.toppings);
    expect(roundTripped.is_new).toBe(sampleProductRow.is_new);
  });

  it('strips toppings for cookies category', () => {
    const row: ProductRow = { ...sampleProductRow, category: 'cookies', toppings: ['should be stripped'] };
    const result = toProductRow(toProductFormValues(row));
    expect(result.toppings).toEqual([]);
  });

  it('preserves toppings for juice category', () => {
    const row: ProductRow = { ...sampleProductRow, category: 'juice', toppings: ['Chia seeds', 'Nata de coco'] };
    const result = toProductRow(toProductFormValues(row));
    expect(result.toppings).toEqual(['Chia seeds', 'Nata de coco']);
  });
});

// -----------------------------------------------
// Hamper serialization round-trip
// -----------------------------------------------
const sampleSingleHamperRow: HamperRow = {
  id: 'eid-1',
  name: 'Eid Hampers A',
  description: 'A wholesome treat.',
  image: 'https://example.com/hamper.png',
  images: ['https://example.com/img1.png', 'https://example.com/img2.png'],
  price: 90000,
  hamper_variants: [],
  rating: 5.0,
  sales: '89+',
  seasonal: 'Eid Collection',
  whats_included: ['1 cookie jar', 'Gift box'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const sampleMultiHamperRow: HamperRow = {
  id: 'eid-d',
  name: 'Eid Hampers D',
  description: 'Customizable hamper.',
  image: 'https://example.com/hamperd.png',
  images: [],
  price: null,
  hamper_variants: [
    { name: '2x 30gr pouches', price: 65000 },
    { name: '3 juices', price: 85000 },
    { name: '5 juices', price: 125000 },
  ],
  rating: 4.9,
  sales: '78+',
  seasonal: 'Eid Collection',
  whats_included: ['Packaging bag', '2 Greeting cards'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('toHamperFormValues / toHamperRow round-trip', () => {
  it('round-trips a single-price hamper', () => {
    const formValues = toHamperFormValues(sampleSingleHamperRow);
    const result = toHamperRow(formValues);

    expect(result.id).toBe(sampleSingleHamperRow.id);
    expect(result.name).toBe(sampleSingleHamperRow.name);
    expect(result.price).toBe(sampleSingleHamperRow.price);
    expect(result.hamper_variants).toEqual([]);
    expect(result.whats_included).toEqual(sampleSingleHamperRow.whats_included);
    expect(result.rating).toBe(sampleSingleHamperRow.rating);
  });

  it('round-trips a multi-variant hamper', () => {
    const formValues = toHamperFormValues(sampleMultiHamperRow);
    const result = toHamperRow(formValues);

    expect(result.price).toBeNull();
    expect(result.hamper_variants).toEqual(sampleMultiHamperRow.hamper_variants);
  });

  it('single-price form sets pricing_mode to single', () => {
    expect(toHamperFormValues(sampleSingleHamperRow).pricing_mode).toBe('single');
  });

  it('multi-variant form sets pricing_mode to multi', () => {
    expect(toHamperFormValues(sampleMultiHamperRow).pricing_mode).toBe('multi');
  });
});
