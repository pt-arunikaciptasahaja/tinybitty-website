import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import {
  productFormSchema,
  hamperFormSchema,
  isAdminEmail,
  validateImageFile,
  toProductFormValues,
  toProductRow,
  toHamperFormValues,
  toHamperRow,
} from '../adminUtils';
import type { ProductRow, HamperRow } from '@/types/supabase-models';

const NUM_RUNS = 100;

// -----------------------------------------------
// Arbitraries
// -----------------------------------------------

const validVariant = fc.record({
  size: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.integer({ min: 1, max: 100_000_000 }),
});

const validProductFormArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 60 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  category: fc.constantFrom('cookies', 'juice') as fc.Arbitrary<'cookies' | 'juice'>,
  image: fc.webUrl(),
  variants: fc.array(validVariant, { minLength: 1, maxLength: 6 }),
  ingredients: fc.array(fc.string({ minLength: 1 }), { maxLength: 10 }),
  toppings: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
  is_new: fc.boolean(),
});

const validHamperFormSingleArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 60 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  image: fc.webUrl(),
  images: fc.array(fc.webUrl(), { maxLength: 10 }),
  pricing_mode: fc.constant('single') as fc.Arbitrary<'single'>,
  price: fc.integer({ min: 1, max: 100_000_000 }),
  hamper_variants: fc.constant([]),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  sales: fc.string({ minLength: 1, maxLength: 20 }),
  seasonal: fc.string({ minLength: 1, maxLength: 50 }),
  whats_included: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
});

const validHamperFormMultiArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 60 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  image: fc.webUrl(),
  images: fc.array(fc.webUrl(), { maxLength: 10 }),
  pricing_mode: fc.constant('multi') as fc.Arbitrary<'multi'>,
  price: fc.constant(undefined),
  hamper_variants: fc.array(
    fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 }),
      price: fc.integer({ min: 1, max: 100_000_000 }),
    }),
    { minLength: 1, maxLength: 5 }
  ),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  sales: fc.string({ minLength: 1, maxLength: 20 }),
  seasonal: fc.string({ minLength: 1, maxLength: 50 }),
  whats_included: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
});

// -----------------------------------------------
// Property 1: Product form validation rejects invalid inputs
// -----------------------------------------------
describe('Property 1 — Product form rejects invalid inputs', () => {
  it('rejects when name is empty', () => {
    fc.assert(
      fc.property(
        validProductFormArb.map((v) => ({ ...v, name: '' })),
        (input) => {
          const result = productFormSchema.safeParse(input);
          return result.success === false;
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when variants array is empty', () => {
    fc.assert(
      fc.property(
        validProductFormArb.map((v) => ({ ...v, variants: [] })),
        (input) => productFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when a variant price is 0', () => {
    fc.assert(
      fc.property(
        validProductFormArb.map((v) => ({
          ...v,
          variants: [{ size: 'Large', price: 0 }],
        })),
        (input) => productFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when a variant price exceeds 100_000_000', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100_000_001, max: 999_999_999 }).chain((badPrice) =>
          validProductFormArb.map((v) => ({
            ...v,
            variants: [{ size: 'Large', price: badPrice }],
          }))
        ),
        (input) => productFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when image is not a valid URL', () => {
    fc.assert(
      fc.property(
        validProductFormArb.map((v) => ({ ...v, image: 'not-a-url' })),
        (input) => productFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });
});

// -----------------------------------------------
// Property 2: Hamper form validation rejects invalid inputs
// -----------------------------------------------
describe('Property 2 — Hamper form rejects invalid inputs', () => {
  it('rejects when name is empty', () => {
    fc.assert(
      fc.property(
        validHamperFormSingleArb.map((v) => ({ ...v, name: '' })),
        (input) => hamperFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when rating > 5', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(5.01), max: Math.fround(100), noNaN: true }).chain((badRating) =>
          validHamperFormSingleArb.map((v) => ({ ...v, rating: badRating }))
        ),
        (input) => hamperFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when rating < 0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-100), max: Math.fround(-0.01), noNaN: true }).chain((badRating) =>
          validHamperFormSingleArb.map((v) => ({ ...v, rating: badRating }))
        ),
        (input) => hamperFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when whats_included is empty', () => {
    fc.assert(
      fc.property(
        validHamperFormSingleArb.map((v) => ({ ...v, whats_included: [] })),
        (input) => hamperFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects when a multi-variant price is 0', () => {
    fc.assert(
      fc.property(
        validHamperFormMultiArb.map((v) => ({
          ...v,
          hamper_variants: [{ name: 'Variant A', price: 0 }],
        })),
        (input) => hamperFormSchema.safeParse(input).success === false
      ),
      { numRuns: NUM_RUNS }
    );
  });
});

// -----------------------------------------------
// Property 3: Pricing mode mutual exclusivity
// -----------------------------------------------
describe('Property 3 — Pricing mode mutual exclusivity', () => {
  it('single mode → toHamperRow produces null price field and empty hamper_variants', () => {
    fc.assert(
      fc.property(validHamperFormSingleArb, (input) => {
        const row = toHamperRow({ ...input, hamper_variants: [] });
        return (
          typeof row.price === 'number' &&
          row.price > 0 &&
          row.hamper_variants.length === 0
        );
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('multi mode → toHamperRow produces null price and non-empty hamper_variants', () => {
    fc.assert(
      fc.property(validHamperFormMultiArb, (input) => {
        const row = toHamperRow(input);
        return row.price === null && row.hamper_variants.length > 0;
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// -----------------------------------------------
// Property 4: Image file validation rejects disallowed types and oversized files
// -----------------------------------------------
const MB = 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

describe('Property 4 — Image validation rejects invalid files', () => {
  it('rejects files with disallowed MIME type', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((t) => !ALLOWED_MIMES.includes(t)),
        fc.integer({ min: 1, max: 4 * MB }),
        (mimeType, size) => {
          const result = validateImageFile({ type: mimeType, size, name: 'file.jpg' });
          return result.isValid === false;
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('rejects files larger than 5 MB', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALLOWED_MIMES),
        fc.integer({ min: 5 * MB + 1, max: 50 * MB }),
        (mimeType, size) => {
          const result = validateImageFile({ type: mimeType, size, name: 'big.jpg' });
          return result.isValid === false;
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});

// -----------------------------------------------
// Property 5: Product serialization round-trip
// -----------------------------------------------
const productRowArb: fc.Arbitrary<ProductRow> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 60 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  category: fc.constantFrom('cookies', 'juice') as fc.Arbitrary<'cookies' | 'juice'>,
  image: fc.webUrl(),
  variants: fc.array(validVariant, { minLength: 1, maxLength: 6 }),
  ingredients: fc.array(fc.string({ minLength: 1 }), { maxLength: 10 }),
  toppings: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
  is_new: fc.boolean(),
  created_at: fc.constant('2026-01-01T00:00:00Z'),
  updated_at: fc.constant('2026-01-01T00:00:00Z'),
});

describe('Property 5 — Product serialization round-trip', () => {
  it('toProductFormValues → toProductRow preserves all non-timestamp fields', () => {
    fc.assert(
      fc.property(productRowArb, (row) => {
        const formValues = toProductFormValues(row);
        const result = toProductRow(formValues);

        const toppingsMatch =
          row.category === 'juice'
            ? JSON.stringify(result.toppings) === JSON.stringify(row.toppings)
            : result.toppings.length === 0;

        return (
          result.id === row.id &&
          result.name === row.name &&
          result.description === row.description &&
          result.category === row.category &&
          result.image === row.image &&
          JSON.stringify(result.variants) === JSON.stringify(row.variants) &&
          JSON.stringify(result.ingredients) === JSON.stringify(row.ingredients) &&
          result.is_new === row.is_new &&
          toppingsMatch
        );
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// -----------------------------------------------
// Property 6: Hamper serialization round-trip
// -----------------------------------------------
const singleHamperRowArb: fc.Arbitrary<HamperRow> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 60 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  image: fc.webUrl(),
  images: fc.array(fc.webUrl(), { maxLength: 10 }),
  price: fc.integer({ min: 1, max: 100_000_000 }),
  hamper_variants: fc.constant([]),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  sales: fc.string({ minLength: 1, maxLength: 20 }),
  seasonal: fc.string({ minLength: 1, maxLength: 50 }),
  whats_included: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
  created_at: fc.constant('2026-01-01T00:00:00Z'),
  updated_at: fc.constant('2026-01-01T00:00:00Z'),
});

const multiHamperRowArb: fc.Arbitrary<HamperRow> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 60 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  image: fc.webUrl(),
  images: fc.array(fc.webUrl(), { maxLength: 10 }),
  price: fc.constant(null),
  hamper_variants: fc.array(
    fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 }),
      price: fc.integer({ min: 1, max: 100_000_000 }),
    }),
    { minLength: 1, maxLength: 5 }
  ),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  sales: fc.string({ minLength: 1, maxLength: 20 }),
  seasonal: fc.string({ minLength: 1, maxLength: 50 }),
  whats_included: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
  created_at: fc.constant('2026-01-01T00:00:00Z'),
  updated_at: fc.constant('2026-01-01T00:00:00Z'),
});

describe('Property 6 — Hamper serialization round-trip', () => {
  it('preserves single-price hamper fields', () => {
    fc.assert(
      fc.property(singleHamperRowArb, (row) => {
        const result = toHamperRow(toHamperFormValues(row));
        return (
          result.id === row.id &&
          result.name === row.name &&
          result.price === row.price &&
          result.hamper_variants.length === 0 &&
          JSON.stringify(result.whats_included) === JSON.stringify(row.whats_included)
        );
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('preserves multi-variant hamper fields', () => {
    fc.assert(
      fc.property(multiHamperRowArb, (row) => {
        const result = toHamperRow(toHamperFormValues(row));
        return (
          result.price === null &&
          JSON.stringify(result.hamper_variants) === JSON.stringify(row.hamper_variants) &&
          JSON.stringify(result.whats_included) === JSON.stringify(row.whats_included)
        );
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// -----------------------------------------------
// Property 7: Admin allowlist check is consistent (pure/idempotent)
// -----------------------------------------------
describe('Property 7 — isAdminEmail is pure and idempotent', () => {
  it('returns the same value on repeated calls for any email string', () => {
    fc.assert(
      fc.property(fc.string(), (email) => {
        return isAdminEmail(email) === isAdminEmail(email);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('returns the same value for email addresses', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        return isAdminEmail(email) === isAdminEmail(email);
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
