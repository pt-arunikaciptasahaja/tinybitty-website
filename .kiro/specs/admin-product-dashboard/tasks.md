# Implementation Plan: Admin Product Dashboard

## Overview

Migrate product and hamper data from static files to Supabase, build a protected `/admin` dashboard for full CRUD over products and hampers, and update storefront components to fetch data dynamically. The plan is ordered so each step is a valid compilation checkpoint before the next begins.

## Tasks

- [ ] 1. Supabase backend setup (SQL, RLS, Storage)
  - [ ] 1.1 Create `products` and `hampers` tables with correct column types, constraints, and defaults
    - Execute the `CREATE TABLE products (...)` DDL from the design document in the Supabase SQL editor
    - Execute the `CREATE TABLE hampers (...)` DDL from the design document
    - Verify both tables exist and accept sample `INSERT` statements
    - _Requirements: 13.1_

  - [ ] 1.2 Apply Row Level Security policies on both tables and configure the `product-images` Storage bucket
    - Enable RLS on `products` and `hampers` with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
    - Create `products_public_read`, `products_admin_write`, `hampers_public_read`, `hampers_admin_write` policies exactly as defined in the design document
    - Create the `product-images` Storage bucket (set to public) and attach `storage_public_read`, `storage_admin_upload`, `storage_admin_delete` policies
    - _Requirements: 13.1, 13.2_

- [ ] 2. Foundation — types, Supabase client, and environment
  - [ ] 2.1 Create `src/types/supabase-models.ts` with all DB row and variant types
    - Define and export `ProductVariantDB`, `ProductRow`, `HamperVariantDB`, `HamperRow` interfaces exactly as specified in the design document
    - _Requirements: 3.1, 7.1_

  - [ ] 2.2 Create `src/lib/supabase.ts` as the singleton Supabase client
    - Import `createClient` from `@supabase/supabase-js`
    - Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`
    - Export the named `supabase` constant
    - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` entries to `.env.local` (template only; real values added by developer)
    - _Requirements: 13.4_

  - [ ] 2.3 Create `src/lib/adminUtils.ts` with `isAdminEmail` helper and serialization utilities
    - Implement `isAdminEmail(email: string): boolean` — checks against the hardcoded allowlist; pure function with no side effects
    - Implement `toProductFormValues(row: ProductRow)` — converts a DB row to the `productFormSchema` shape (mapping `is_new` → `isNew`, etc.)
    - Implement `toProductRow(formValues)` — inverse of above, produces a DB-ready object
    - Implement `toHamperFormValues(row: HamperRow)` — converts a DB row to the `hamperFormSchema` shape (maps `hamper_variants` → multi/single mode, `whats_included` → `whatsIncluded`, etc.)
    - Implement `toHamperRow(formValues)` — inverse of above
    - Implement `validateImageFile(file: { type: string; size: number }): { isValid: boolean; error?: string }` — checks MIME type and size
    - _Requirements: 1.4, 3.1, 4.2, 7.1, 8.2, 10.1, 10.2, 13.1_

- [ ] 3. Auth layer — context, guard, and login page
  - [ ] 3.1 Create `src/contexts/AuthContext.tsx` providing session state and auth helpers
    - Implement `AuthContextValue` interface (`session`, `isAdmin`, `isLoading`, `signIn`, `signOut`)
    - On mount, call `supabase.auth.getSession()` with a 5-second timeout; if it does not resolve, treat as unauthenticated
    - Subscribe to `supabase.auth.onAuthStateChange` to keep `session` current
    - Derive `isAdmin` from `isAdminEmail(session?.user?.email ?? '')`
    - Export `AuthProvider` and `useAuth` hook
    - _Requirements: 1.2, 1.3, 1.4, 1.7_

  - [ ] 3.2 Create `src/components/admin/AuthGuard.tsx` protecting admin routes
    - Consume `useAuth()`; while `isLoading` show a centered spinner
    - If `session` is null, redirect to `/admin/login`
    - If `session` is present but `isAdmin` is false, redirect to `/admin/login` and pass state `{ accessDenied: true }`
    - Render `children` only when `isAdmin` is true
    - _Requirements: 1.1, 1.3, 1.4, 1.7_

  - [ ] 3.3 Create `src/pages/admin/AdminLoginPage.tsx`
    - Build a controlled form with `email` and `password` fields using `react-hook-form` + `zod`
    - On submit, call `signIn(email, password)` from `useAuth()`
    - Display "Invalid email or password" on auth error; display "Access denied" if redirected with `state.accessDenied`
    - On successful login, navigate to `/admin`
    - _Requirements: 1.2, 1.5, 1.6_

- [ ] 4. Admin routing in `App.tsx` and `AdminLayout`
  - [ ] 4.1 Create `src/components/admin/AdminLayout.tsx` — shared shell for all admin pages
    - Render a top nav bar with the "Tiny Bitty Admin" title, a "Products" tab link, a "Hampers" tab link, and a "Logout" button
    - On logout, call `signOut()` from `useAuth()` then navigate to `/admin/login`
    - Render `<Outlet />` for nested routes
    - _Requirements: 1.5_

  - [ ] 4.2 Wire admin routes in `src/App.tsx`
    - Wrap `AuthProvider` around the root router
    - Add routes: `/admin/login` → `AdminLoginPage`; `/admin` → `AuthGuard` wrapping `AdminLayout` with `AdminDashboardPage` as index child
    - Keep all existing public routes unchanged
    - _Requirements: 1.1, 1.3_

- [ ] 5. Shared admin UI primitives
  - [ ] 5.1 Create `src/components/admin/ImageUploader.tsx`
    - Accept `ImageUploaderProps` (`value`, `onChange`, `bucket?`, `disabled?`)
    - On file selection, call `validateImageFile` from `src/lib/adminUtils.ts`; if invalid, display the error string and abort
    - On valid file, show a loading spinner and disable the enclosing form's submit via the `disabled` prop; upload to Supabase Storage under `bucket` (default `'product-images'`); on success call `onChange(publicUrl)`; on failure display "Image upload failed." and retain the previous URL
    - _Requirements: 3.4, 3.5, 3.6, 4.3, 4.5, 4.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 5.2 Create `src/components/admin/DeleteConfirmDialog.tsx`
    - Accept `DeleteConfirmDialogProps` (`open`, `itemName`, `onConfirm`, `onCancel`)
    - Render a Radix `AlertDialog` showing "Delete [itemName]?" with Cancel and Confirm buttons
    - Call `onConfirm()` asynchronously; show inline loading state during deletion; on error propagate to parent via re-throw
    - _Requirements: 5.1, 5.5, 9.1, 9.5_

- [ ] 6. Product management UI
  - [ ] 6.1 Create `src/components/admin/products/ProductList.tsx`
    - On mount, fetch all products from `supabase.from('products').select('*').order('name')` grouped by category (`cookies` then `juice`)
    - Render each product row with: 80×80 px preview image, name, variant count, `is_new` badge, Edit button, Delete button
    - Show a loading skeleton while fetching; show an error message + Retry button on failure; show an empty-state message when a category has no products
    - Wire Edit button to call an `onEdit(product: ProductRow)` prop; wire Delete button to open `DeleteConfirmDialog`, then call `supabase.from('products').delete()` on confirm; remove the row from local state on success; show error message on failure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 6.2 Create `src/components/admin/products/ProductForm.tsx`
    - Accept `ProductFormProps` (`product?`, `onSuccess`, `onCancel`)
    - Build the form with `react-hook-form` + `zodResolver` using `productFormSchema` from the design document
    - Fields: `id` (auto-generated slug in create mode, read-only in edit mode), `name`, `description`, `category` (select: cookies/juice), `is_new` checkbox, `image` (via `ImageUploader`), `variants` dynamic array (size + price), `ingredients` dynamic array, `toppings` dynamic array (shown only when `category === 'juice'`)
    - In edit mode, call `toProductFormValues(product)` to pre-populate; merge back via `toProductRow(formValues)` before upsert
    - On submit, call `supabase.from('products').upsert(...)` with `onConflict: 'id'`; on success call `onSuccess()`; on failure retain field values and display error
    - Display inline validation errors adjacent to each invalid field; disable submit while `ImageUploader` is uploading
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [ ] 7. Hamper management UI
  - [ ] 7.1 Create `src/components/admin/hampers/HamperList.tsx`
    - On mount, fetch all hampers from `supabase.from('hampers').select('*')`
    - Render each row with: 80×80 px preview image, name, seasonal tag, sales label (hidden if empty or `'0+'`), Edit button, Delete button
    - Apply hide-logic for zero-price hampers per Requirements 6.3
    - Show loading skeleton, error + Retry, and empty-state as in `ProductList`
    - Wire Edit and Delete similarly to `ProductList`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 7.2 Create `src/components/admin/hampers/HamperForm.tsx`
    - Accept `HamperFormProps` (`hamper?`, `onSuccess`, `onCancel`)
    - Build the form using `hamperFormSchema` from the design document
    - Fields: `id`, `name`, `description`, `pricing_mode` toggle (single/multi), `price` (single mode only), `hamper_variants` dynamic array (multi mode only), `rating`, `sales`, `seasonal`, `image` (via `ImageUploader`), `images` gallery array (each via `ImageUploader`; max 10; support add, remove, reorder with up/down buttons), `whats_included` dynamic array (min 1)
    - Switching `pricing_mode` clears the opposite field group (single → clears `hamper_variants`; multi → clears `price`)
    - In edit mode, call `toHamperFormValues(hamper)` to pre-populate; merge back via `toHamperRow(formValues)` before upsert
    - On submit, call `supabase.from('hampers').upsert(...)` with `onConflict: 'id'`; on success call `onSuccess()`; on failure retain values and display error
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 8. Admin dashboard page
  - [ ] 8.1 Create `src/pages/admin/AdminDashboardPage.tsx`
    - Render two tabs: "Products" and "Hampers" using the existing `Tabs` component
    - Products tab: render `ProductList`; when `onEdit(product)` is fired, slide open or modal `ProductForm` in edit mode; provide a "New Product" button that opens `ProductForm` in create mode
    - Hampers tab: render `HamperList`; when `onEdit(hamper)` is fired, open `HamperForm` in edit mode; provide a "New Hamper" button that opens `HamperForm` in create mode
    - After `onSuccess` from any form, call the list's refetch function and show a success toast that auto-dismisses in 5 seconds
    - _Requirements: 2.1, 3.8, 4.8, 5.3, 6.1, 7.9, 8.6, 9.3_

- [ ] 9. Checkpoint — Admin dashboard functional
  - Ensure all admin routes render without TypeScript errors, `AuthGuard` redirects work correctly, and CRUD operations succeed against your local Supabase instance.
  - Ensure all tests written so far pass. Ask the user if any questions arise.

- [ ] 10. Storefront updates — dynamic data loading
  - [ ] 10.1 Refactor `src/components/ProductSection.tsx` to fetch data from Supabase internally
    - Remove the `categories` prop and `ProductSectionProps` interface
    - Add a `useEffect` that calls `supabase.from('products').select('*')` and groups rows by `category`
    - Map `ProductRow` fields to the existing `Product` interface shape (note: DB uses `is_new`; component uses `isNew`)
    - Keep the existing tabs/carousel rendering logic; only replace the data source
    - Show a loading spinner while fetching; show an error message (no card rendering) on failure; show an empty-state message if the result set is empty
    - _Requirements: 11.1, 11.3, 11.5, 11.7_

  - [ ] 10.2 Refactor `src/components/HampersSection.tsx` to fetch data from Supabase internally
    - Remove the hardcoded `seasonalHampers` constant
    - Add a `useEffect` that calls `supabase.from('hampers').select('*')`
    - Map `HamperRow` fields to the shape expected by `HamperCard` (note: DB uses `whats_included`; card uses `whatsIncluded`; DB multi-variant uses `hamper_variants`)
    - Show a loading spinner while fetching; show an error message on failure
    - _Requirements: 11.2, 11.4, 11.6_

  - [ ] 10.3 Simplify `src/components/home.tsx`
    - Remove the `import productsData from '@/data/products.json'` import
    - Remove all `sortedCookies`, `sortedJuice`, `sortedMacaroni`, `sortedTokyoCrumb`, and `categories` variables
    - Render `<ProductSection />` with no props; render `<HampersSection />` as before
    - _Requirements: 11.1, 11.2_

- [ ] 11. Migration script
  - [ ] 11.1 Create `scripts/seed.mjs` that upserts all static data into Supabase
    - Read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `process.env` (not `VITE_`-prefixed)
    - Initialize a Supabase client with the service role key
    - Read and parse `src/data/products.json`; filter to `cookies` and `juice` categories only; map each item to a `ProductRow` shape (rename `isNew` → `is_new`, ensure `toppings` defaults to `[]`)
    - Copy the `seasonalHampers` array from `HampersSection.tsx` as a JS literal; map each item to a `HamperRow` shape (rename `whatsIncluded` → `whats_included`; for `eid-d`, set `price: null` and populate `hamper_variants` from the three variants; for others, set `price` and `hamper_variants: []`)
    - Call `supabase.from('products').upsert(rows, { onConflict: 'id' })` and `supabase.from('hampers').upsert(rows, { onConflict: 'id' })`
    - Log success counts; log and exit with code 1 on any error
    - _Requirements: 12.1, 12.2, 12.3, 13.4_

- [ ] 12. Test setup and property-based tests
  - [ ] 12.1 Install `vitest`, `@vitest/ui`, `jsdom`, and `fast-check`; create `vitest.config.ts`
    - Run `npm install --save-dev vitest @vitest/ui jsdom fast-check`
    - Create `vitest.config.ts` at the project root with `globals: true` and `environment: 'jsdom'`
    - Add a `"test": "vitest --run"` script to `package.json`
    - _Requirements: design testing strategy_

  - [ ] 12.2 Create unit test file `src/lib/__tests__/adminUtils.test.ts`
    - Test `isAdminEmail`: known admin email returns `true`; unknown email returns `false`; different casing returns `false`
    - Test `validateImageFile`: each allowed MIME type passes; disallowed types fail; file at exactly 5 MB passes; file at 5 MB + 1 byte fails
    - Test `toProductFormValues` / `toProductRow` round-trip for a complete `ProductRow` fixture
    - Test `toHamperFormValues` / `toHamperRow` round-trip for single-price and multi-variant `HamperRow` fixtures
    - _Requirements: 3.1, 4.2, 7.1, 8.2, 10.1, 10.2, 13.1_

  - [ ] 12.3 Write property test — Property 1: Product form validation rejects invalid inputs
    - File: `src/lib/__tests__/properties.test.ts`
    - Use `fc.assert(fc.property(...), { numRuns: 100 })` with fast-check arbitraries that generate product form objects missing a required field OR with empty `variants` OR with price `≤ 0` OR price `> 100_000_000`
    - Assert `productFormSchema.safeParse(input).success === false` for all generated inputs
    - **Property 1 — Validates: Requirements 3.3, 3.7**
    - _Requirements: 3.3, 3.7_

  - [ ] 12.4 Write property test — Property 2: Hamper form validation rejects invalid inputs
    - Generate hamper form objects with at least one invalid field (missing required string, `rating` outside 0–5, empty `whats_included`, variant price `≤ 0`)
    - Assert `hamperFormSchema.safeParse(input).success === false`
    - **Property 2 — Validates: Requirements 7.1, 7.5, 7.8**
    - _Requirements: 7.1, 7.5, 7.8_

  - [ ] 12.5 Write property test — Property 3: Pricing mode mutual exclusivity
    - Generate hamper form values with `pricing_mode: 'single'` (should have empty `hamper_variants`) and with `pricing_mode: 'multi'` (should have `price` as `undefined` or `null`)
    - After normalization via `toHamperRow`, assert the correct field is absent/empty
    - **Property 3 — Validates: Requirements 7.4**
    - _Requirements: 7.4_

  - [ ] 12.6 Write property test — Property 4: Image file validation rejects disallowed types and oversized files
    - Generate `{ type: string; size: number }` objects where `type` is not in `['image/jpeg','image/png','image/webp']` OR `size > 5_242_880`
    - Assert `validateImageFile(file).isValid === false` for all generated inputs
    - **Property 4 — Validates: Requirements 3.4, 10.1, 10.2**
    - _Requirements: 3.4, 10.1, 10.2_

  - [ ] 12.7 Write property test — Property 5: Product serialization round-trip
    - Generate valid `ProductRow` objects (all required fields with correct types)
    - Apply `toProductFormValues` then `toProductRow`; assert deep equality on `name`, `description`, `category`, `image`, `variants`, `ingredients`, `toppings`, `is_new`
    - **Property 5 — Validates: Requirements 3.1, 4.2**
    - _Requirements: 3.1, 4.2_

  - [ ] 12.8 Write property test — Property 6: Hamper serialization round-trip
    - Generate valid `HamperRow` objects for both single-price and multi-variant modes
    - Apply `toHamperFormValues` then `toHamperRow`; assert deep equality on all non-timestamp fields
    - **Property 6 — Validates: Requirements 7.1, 8.2**
    - _Requirements: 7.1, 8.2_

  - [ ] 12.9 Write property test — Property 7: Admin allowlist check is consistent
    - Generate random email strings via `fc.emailAddress()` and `fc.string()`
    - Assert `isAdminEmail(email) === isAdminEmail(email)` (idempotent, pure)
    - **Property 7 — Validates: Requirements 1.4, 13.1**
    - _Requirements: 1.4, 13.1_

- [ ] 13. Final checkpoint — full suite green
  - Run `npm run test` and confirm all unit tests and property tests pass.
  - Run `npm run build` (or `tsc`) and confirm zero TypeScript errors.
  - Ensure all tests pass. Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The design document uses TypeScript throughout — no language selection needed
- `fast-check` is not yet installed; Task 12.1 installs it before the property tests are written
- The `scripts/seed.mjs` script uses the **service role key** which must never be prefixed with `VITE_` and must not appear in the compiled frontend bundle (Requirement 13.4)
- `ProductSection` currently renders a `macaroni` and `tokyo_crumb` tab driven by the static JSON. After Task 10.1 those categories will only appear if records exist in the Supabase `products` table (the migration script in Task 11.1 intentionally seeds only `cookies` and `juice`). Confirm with the stakeholder whether macaroni/tokyo crumb should be migrated
- Existing `src/types/supabase.ts` (generated types) is separate from the hand-authored `src/types/supabase-models.ts` created in Task 2.1; both can coexist

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["3.1", "12.1"] },
    { "id": 5, "tasks": ["3.2", "3.3"] },
    { "id": 6, "tasks": ["4.1"] },
    { "id": 7, "tasks": ["4.2", "5.1", "5.2"] },
    { "id": 8, "tasks": ["6.1", "6.2"] },
    { "id": 9, "tasks": ["7.1", "7.2"] },
    { "id": 10, "tasks": ["8.1"] },
    { "id": 11, "tasks": ["10.1", "10.2", "11.1"] },
    { "id": 12, "tasks": ["10.3"] },
    { "id": 13, "tasks": ["12.2"] },
    { "id": 14, "tasks": ["12.3", "12.4", "12.5", "12.6", "12.7", "12.8", "12.9"] }
  ]
}
```
