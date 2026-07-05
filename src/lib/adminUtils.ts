import { z } from 'zod';
import type { ProductRow, HamperRow } from '@/types/supabase-models';

// -----------------------------------------------
// Admin allowlist
// -----------------------------------------------

const ADMIN_EMAILS: string[] = [
  'tinybitty.tb@gmail.com',
  // Add more admin emails here
];

/**
 * Pure function — checks if an email is in the admin allowlist.
 * Case-sensitive to match Supabase auth.email() behaviour.
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

// -----------------------------------------------
// Image file validation
// -----------------------------------------------

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: {
  type: string;
  size: number;
  name?: string;
}): { isValid: boolean; error?: string } {
  // Size check first — cheapest
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File must be smaller than 5 MB.' };
  }

  // MIME type check
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      isValid: false,
      error: 'File must be JPEG, PNG, or WebP format.',
    };
  }

  // Extension check (when filename is available)
  if (file.name) {
    const ext = ('.' + file.name.split('.').pop()?.toLowerCase()) as string;
    if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
      return {
        isValid: false,
        error: 'File extension must be .jpg, .jpeg, .png, or .webp.',
      };
    }
  }

  return { isValid: true };
}

// -----------------------------------------------
// Product Zod schema
// -----------------------------------------------

export const productFormSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['cookies', 'juice']),
  image: z.string().url('A valid image URL is required'),
  variants: z
    .array(
      z.object({
        size: z.string().min(1, 'Size is required'),
        price: z
          .number({ invalid_type_error: 'Price must be a number' })
          .int('Price must be a whole number')
          .min(1, 'Price must be greater than 0')
          .max(100_000_000, 'Price is too large'),
      })
    )
    .min(1, 'At least one variant is required'),
  ingredients: z.array(z.string().min(1)).default([]),
  toppings: z.array(z.string().min(1)).default([]),
  is_new: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// -----------------------------------------------
// Hamper Zod schema
// -----------------------------------------------

export const hamperFormSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('A valid primary image URL is required'),
  images: z.array(z.string().url('Each gallery URL must be valid')).max(10).default([]),
  pricing_mode: z.enum(['single', 'multi']),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .int()
    .min(1)
    .max(100_000_000)
    .optional(),
  hamper_variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name is required'),
        price: z
          .number({ invalid_type_error: 'Price must be a number' })
          .int()
          .min(1, 'Price must be greater than 0')
          .max(100_000_000),
      })
    )
    .default([]),
  rating: z
    .number({ invalid_type_error: 'Rating must be a number' })
    .min(0, 'Rating must be at least 0')
    .max(5, 'Rating must be at most 5'),
  sales: z.string().min(1, 'Sales label is required'),
  seasonal: z.string().min(1, 'Seasonal tag is required'),
  whats_included: z
    .array(z.string().min(1, 'Item cannot be empty'))
    .min(1, "At least one 'what's included' item is required"),
});

export type HamperFormValues = z.infer<typeof hamperFormSchema>;

// -----------------------------------------------
// Product serialization helpers
// -----------------------------------------------

/**
 * Convert a Supabase ProductRow to ProductFormValues shape.
 */
export function toProductFormValues(row: ProductRow): ProductFormValues {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    image: row.image,
    variants: row.variants.map((v) => ({ size: v.size, price: v.price })),
    ingredients: [...row.ingredients],
    toppings: [...row.toppings],
    is_new: row.is_new,
  };
}

/**
 * Convert ProductFormValues back to a DB-ready object (no timestamps).
 */
export function toProductRow(
  formValues: ProductFormValues
): Omit<ProductRow, 'created_at' | 'updated_at'> {
  return {
    id: formValues.id,
    name: formValues.name,
    description: formValues.description,
    category: formValues.category,
    image: formValues.image,
    variants: formValues.variants.map((v) => ({ size: v.size, price: v.price })),
    ingredients: [...formValues.ingredients],
    toppings: formValues.category === 'juice' ? [...formValues.toppings] : [],
    is_new: formValues.is_new,
  };
}

// -----------------------------------------------
// Hamper serialization helpers
// -----------------------------------------------

/**
 * Convert a Supabase HamperRow to HamperFormValues shape.
 */
export function toHamperFormValues(row: HamperRow): HamperFormValues {
  const isMulti = row.hamper_variants.length > 0;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    images: [...row.images],
    pricing_mode: isMulti ? 'multi' : 'single',
    price: isMulti ? undefined : (row.price ?? undefined),
    hamper_variants: isMulti
      ? row.hamper_variants.map((v) => ({ name: v.name, price: v.price }))
      : [],
    rating: row.rating,
    sales: row.sales,
    seasonal: row.seasonal,
    whats_included: [...row.whats_included],
  };
}

/**
 * Convert HamperFormValues back to a DB-ready object (no timestamps).
 */
export function toHamperRow(
  formValues: HamperFormValues
): Omit<HamperRow, 'created_at' | 'updated_at'> {
  return {
    id: formValues.id,
    name: formValues.name,
    description: formValues.description,
    image: formValues.image,
    images: [...formValues.images],
    price: formValues.pricing_mode === 'single' ? (formValues.price ?? null) : null,
    hamper_variants:
      formValues.pricing_mode === 'multi'
        ? formValues.hamper_variants.map((v) => ({ name: v.name, price: v.price }))
        : [],
    rating: formValues.rating,
    sales: formValues.sales,
    seasonal: formValues.seasonal,
    whats_included: [...formValues.whats_included],
  };
}
