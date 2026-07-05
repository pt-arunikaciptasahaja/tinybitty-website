# Requirements Document

## Introduction

This feature adds an admin product management dashboard to the Tiny Bitty bakery/food e-commerce website. Currently, product data is stored in a static JSON file (`src/data/products.json`) and hampers data is hardcoded in `HampersSection.tsx`. The dashboard will migrate all product data to a Supabase (PostgreSQL) database, expose a protected `/admin` route for authorized admins to create, update, and delete products and hampers, and replace Cloudinary image hosting with Supabase Storage. The storefront components (`ProductSection`, `HampersSection`) will be updated to fetch data dynamically from Supabase instead of the static files.

Product categories: **cookies**, **juice**, and **hampers** (seasonal gift sets).

---

## Glossary

- **Admin_Dashboard**: The protected React application accessible at the `/admin` route, used to manage products and hampers.
- **Admin_User**: An authenticated Supabase Auth user whose email address is present in the system-maintained admin allowlist.
- **Auth_Guard**: The client-side route protection component that redirects unauthenticated or unauthorized users away from `/admin`.
- **Product**: A menu item belonging to one of the categories: cookies or juice.
- **Hamper**: A seasonal gift set item displayed in the HampersSection, with its own data shape distinct from regular Products.
- **Product_Variant**: A size/price combination belonging to a Product (e.g., "Large 400gr / Rp 220,000").
- **Hamper_Variant**: A named price option for a multi-price Hamper (e.g., "2x 30gr pouches / Rp 65,000" for the eid-d hamper).
- **Supabase_Client**: The initialized `@supabase/supabase-js` client used for database queries, authentication, and storage operations.
- **Storage_Bucket**: A Supabase Storage bucket used to store product and hamper images, replacing Cloudinary.
- **Image_Uploader**: The Admin_Dashboard UI component responsible for uploading images to Supabase Storage and returning a public URL.
- **ProductSection**: The existing storefront React component that renders Product cards for cookies and juice categories.
- **HampersSection**: The existing storefront React component that renders Hamper cards for seasonal gift sets.
- **Product_Form**: The Admin_Dashboard form component used to create or edit a Product record.
- **Hamper_Form**: The Admin_Dashboard form component used to create or edit a Hamper record.

---

## Requirements

### Requirement 1: Admin Authentication

**User Story:** As an admin, I want to log in with my credentials so that only authorized users can access the product management dashboard.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to `/admin`, THE Auth_Guard SHALL redirect the user to the `/admin/login` page.
2. WHEN an Admin_User submits a registered email address and its matching password on the login page, THE Supabase_Client SHALL authenticate the user via Supabase Auth email/password sign-in.
3. WHEN authentication succeeds, THE Auth_Guard SHALL allow access to the Admin_Dashboard at `/admin`.
4. WHEN an authenticated user whose email is not present in the admin allowlist attempts to access `/admin`, THE Auth_Guard SHALL set the user's access state to denied, redirect the user to the `/admin/login` page, and display an "Access denied" message.
5. WHEN an Admin_User clicks the logout button, THE Admin_Dashboard SHALL sign out the session via Supabase Auth and redirect to `/admin/login`.
6. IF authentication fails due to invalid credentials, THEN THE Admin_Dashboard SHALL display an error message that indicates the reason for failure (e.g., "Invalid email or password") and contains no stack traces, raw error objects, or internal system identifiers.
7. WHILE a session check is in progress, THE Auth_Guard SHALL display a loading indicator rather than prematurely redirecting the user. IF the session check has not resolved within 5 seconds, THEN THE Auth_Guard SHALL treat the session as unauthenticated and redirect to `/admin/login`.

---

### Requirement 2: Product Listing

**User Story:** As an admin, I want to see all products organized by category so that I can quickly find and manage any product.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE Admin_Dashboard SHALL fetch all Products from the Supabase database and display them grouped by category in the order: cookies, juice; within each category products SHALL be sorted by name ascending.
2. THE Admin_Dashboard SHALL display each Product's name, scaled-down preview image (rendered at no more than 80×80 px), variant count, and isNew status in the product listing.
3. WHEN the database query returns no products for a category, THE Admin_Dashboard SHALL display an empty state message for that category.
4. IF the Supabase database query fails, THEN THE Admin_Dashboard SHALL display an error message and render a retry button that, when clicked, re-triggers the database fetch.
5. WHILE the database fetch is in progress, THE Admin_Dashboard SHALL display a loading indicator in place of the product listing.

---

### Requirement 3: Product Creation

**User Story:** As an admin, I want to add new products to any category so that the storefront reflects the latest menu offerings.

#### Acceptance Criteria

1. WHEN an Admin_User submits a valid Product_Form, THE Admin_Dashboard SHALL insert a new Product record into the Supabase database with all required fields: auto-generated id, name, description, category, image URL, variants (array of size + price), ingredients (array of strings), and isNew flag.
2. WHERE a product category is juice, THE Product_Form SHALL include optional fields for toppings (array of strings).
3. THE Product_Form SHALL require at least one Product_Variant entry with a non-empty size string and a positive integer price in IDR; price values must be greater than 0 and less than or equal to 100,000,000.
4. WHEN an Admin_User selects an image file in the Product_Form, THE Image_Uploader SHALL validate that the file is JPEG, PNG, or WebP format and does not exceed 5 MB before uploading; IF validation fails, THE Image_Uploader SHALL display a validation error and not initiate an upload.
5. WHEN an Admin_User uploads a valid image in the Product_Form, THE Image_Uploader SHALL upload the file to the Storage_Bucket and populate the image URL field with the resulting public URL.
6. IF an image upload fails after a valid file is submitted, THEN THE Image_Uploader SHALL display an error message that identifies the upload failure and retain any previously set image URL.
7. IF the Admin_User submits the Product_Form with a missing required field or a format error, THEN THE Product_Form SHALL display a validation error message adjacent to the invalid field and not submit the record to the database.
8. WHEN the Product record is successfully created, THE Admin_Dashboard SHALL display a success toast or inline confirmation message and refresh the product listing for the relevant category.

---

### Requirement 4: Product Editing

**User Story:** As an admin, I want to edit existing products so that I can keep product details, pricing, and images up to date.

#### Acceptance Criteria

1. WHEN an Admin_User selects a Product to edit, THE Product_Form SHALL pre-populate all fields with the current values fetched from the Supabase database record. IF the product record is not found, THEN THE Admin_Dashboard SHALL display an error message and not open the Product_Form.
2. WHEN an Admin_User submits a modified Product_Form, THE Admin_Dashboard SHALL update the existing Product record in the Supabase database.
3. WHEN an Admin_User uploads a new image file during product editing, THE Image_Uploader SHALL upload the new file to the Storage_Bucket and update the image URL field with the new public URL.
4. WHEN the Admin_User submits the Product_Form after uploading a new image, THE Admin_Dashboard SHALL persist the new image URL to the database. IF no new image file was uploaded, THE Admin_Dashboard SHALL leave the existing image URL unchanged.
5. WHILE an image upload is in progress during editing, THE Image_Uploader SHALL display a loading indicator and the Product_Form submit button SHALL be disabled.
6. IF an image upload fails during editing, THEN THE Image_Uploader SHALL display an error message that identifies the upload failure and retain the previously set image URL.
7. WHILE the Product_Form edit session is active, THE Product_Form SHALL allow adding, editing, and removing individual Product_Variant entries; at least one variant must remain at all times.
8. WHEN a Product record is successfully updated, THE Admin_Dashboard SHALL display a success confirmation that auto-dismisses within 5 seconds and refresh the product listing in place.
9. IF the database update operation fails, THEN THE Admin_Dashboard SHALL display an error message that identifies the failure and retain all modified field values in the Product_Form so no data is lost.

---

### Requirement 5: Product Deletion

**User Story:** As an admin, I want to delete products that are no longer available so that customers only see current menu items.

#### Acceptance Criteria

1. WHEN an Admin_User initiates a delete action on a Product, THE Admin_Dashboard SHALL display a confirmation dialog showing the product name before executing the deletion.
2. WHEN the Admin_User confirms the deletion, THE Admin_Dashboard SHALL delete the Product record from the Supabase database.
3. WHEN the Product record is successfully deleted, THE Admin_Dashboard SHALL remove the product from the listing without requiring a full page reload.
4. IF the database delete operation fails, THEN THE Admin_Dashboard SHALL display an error message that identifies the failure and leave the product record intact in both the database and the listing.
5. WHEN the Admin_User cancels the confirmation dialog, THE Admin_Dashboard SHALL close the dialog and make no changes to the product record.

---

### Requirement 6: Hamper Listing

**User Story:** As an admin, I want to see all hampers in one place so that I can manage seasonal gift set offerings.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE Admin_Dashboard SHALL fetch all Hampers from the Supabase database and display them in the hampers section.
2. THE Admin_Dashboard SHALL display each Hamper's name, scaled-down preview image (rendered at no more than 80×80 px), seasonal tag, and sales label in the hamper listing.
3. IF a single-price hamper has a price of 0, THEN THE Admin_Dashboard SHALL hide that hamper from the listing. IF a multi-variant hamper has all Hamper_Variant prices equal to 0, THEN THE Admin_Dashboard SHALL hide that hamper from the listing.
4. IF a hamper's stored sales label is an empty string or "0+", THEN THE Admin_Dashboard SHALL hide the sales count for that hamper rather than displaying a zero or empty value.
5. WHEN the database query returns no hampers, THE Admin_Dashboard SHALL display an empty state message for the hampers section.
6. IF the Supabase database query for hampers fails, THEN THE Admin_Dashboard SHALL display an error message that identifies the failure and render a retry button that, when clicked, re-triggers the fetch.

---

### Requirement 7: Hamper Creation

**User Story:** As an admin, I want to add new hampers so that seasonal gift set collections can be published to the storefront.

#### Acceptance Criteria

1. WHEN an Admin_User submits a valid Hamper_Form, THE Admin_Dashboard SHALL insert a new Hamper record into the Supabase database with all required fields: id, name, description, primary image URL, gallery image URLs (array), rating (decimal between 0.0 and 5.0), sales label (non-empty string), seasonal tag, and whatsIncluded list (array of non-empty strings).
2. WHERE a hamper is configured in multi-variant pricing mode, THE Hamper_Form SHALL allow the Admin_User to add one or more Hamper_Variant entries, each with a non-empty name string and a positive integer price in IDR; the single price field SHALL be hidden.
3. WHERE a hamper is configured in single-price mode, THE Hamper_Form SHALL accept a single positive integer price field in IDR; Hamper_Variant entries SHALL not be shown.
4. THE pricing mode (single-price or multi-variant) SHALL be mutually exclusive; switching modes SHALL clear the data from the previous mode.
5. THE Hamper_Form SHALL require at least one non-empty string entry in the whatsIncluded list.
6. WHEN an Admin_User uploads the primary image in the Hamper_Form, THE Image_Uploader SHALL upload the file to the Storage_Bucket and populate the primary image URL field with the resulting public URL.
7. WHEN an Admin_User uploads additional gallery images, THE Image_Uploader SHALL upload each file to the Storage_Bucket and append the resulting public URLs to the gallery images array; the gallery SHALL support up to 10 images.
8. IF the Admin_User submits the Hamper_Form with a missing required field, an invalid rating value, or an empty whatsIncluded list, THEN THE Hamper_Form SHALL display a validation error adjacent to the invalid field and not submit the record to the database.
9. WHEN the Hamper record is successfully created, THE Admin_Dashboard SHALL display a success confirmation and refresh the hamper listing.

---

### Requirement 8: Hamper Editing

**User Story:** As an admin, I want to edit existing hampers so that I can update gift set contents, pricing, and imagery.

#### Acceptance Criteria

1. WHEN an Admin_User selects a Hamper to edit, THE Hamper_Form SHALL pre-populate all fields with the current values fetched from the Supabase database record. IF the hamper record is not found, THEN THE Admin_Dashboard SHALL display an error message and not open the Hamper_Form.
2. WHEN an Admin_User submits a modified Hamper_Form, THE Admin_Dashboard SHALL update the existing Hamper record in the Supabase database.
3. WHILE the Hamper_Form edit session is active, THE Hamper_Form SHALL allow adding and removing gallery images; reordering SHALL be supported via drag-and-drop or up/down controls; the gallery SHALL enforce a maximum of 10 images.
4. WHILE the Hamper_Form edit session is active, THE Hamper_Form SHALL allow adding, editing the text of, and removing whatsIncluded list entries; at least one non-empty entry must remain.
5. IF the Admin_User submits the Hamper_Form with a missing required field or an invalid value, THEN THE Hamper_Form SHALL display a validation error adjacent to the invalid field and not submit to the database.
6. WHEN the Hamper record is successfully updated, THE Admin_Dashboard SHALL display a success confirmation that auto-dismisses within 5 seconds and update the hamper listing in place without a full page reload.
7. IF the database update operation fails, THEN THE Admin_Dashboard SHALL display an error message that identifies the failure and retain all modified field values in the Hamper_Form so no data is lost.

---

### Requirement 9: Hamper Deletion

**User Story:** As an admin, I want to delete hampers that are no longer available so that outdated seasonal items do not appear on the storefront.

#### Acceptance Criteria

1. WHEN an Admin_User initiates a delete action on a Hamper, THE Admin_Dashboard SHALL display a confirmation dialog showing the hamper name before executing the deletion.
2. WHEN the Admin_User confirms the deletion, THE Admin_Dashboard SHALL delete the Hamper record from the Supabase database.
3. WHEN the Hamper record is successfully deleted from the database, THE Admin_Dashboard SHALL remove the hamper from the listing without requiring a full page reload.
4. IF the database delete operation fails, THEN THE Admin_Dashboard SHALL display an error message that identifies the failure and leave the hamper record intact in both the database and the listing.
5. WHEN the Admin_User cancels the confirmation dialog, THE Admin_Dashboard SHALL close the dialog and make no changes to the hamper record.

---

### Requirement 10: Image Management

**User Story:** As an admin, I want to upload and replace product and hamper images so that the storefront always shows current, high-quality visuals.

#### Acceptance Criteria

1. WHEN an Admin_User selects an image file in the Image_Uploader, THE Image_Uploader SHALL validate that the file's MIME type is one of `image/jpeg`, `image/png`, or `image/webp` AND that the file extension matches one of `.jpg`, `.jpeg`, `.png`, or `.webp`; IF either check fails, THE Image_Uploader SHALL display a format error and not initiate an upload.
2. WHEN an Admin_User selects an image file larger than 5 MB, THE Image_Uploader SHALL reject the file and display an error message stating the 5 MB file size limit before any upload attempt is made.
3. WHEN the Image_Uploader uploads a file, THE Supabase_Client SHALL store the file in the designated Storage_Bucket and return a publicly accessible URL.
4. THE Admin_Dashboard SHALL use the public URL returned by Supabase Storage as the image value persisted to the database, replacing any prior Cloudinary URL for that record.
5. WHEN an image upload is in progress, THE Image_Uploader SHALL display a loading indicator and disable the submit button of the enclosing form; WHEN the upload completes or fails, THE submit button SHALL re-enable.
6. IF a Storage_Bucket upload fails, THEN THE Image_Uploader SHALL display an error message that identifies the upload failure; WHILE the upload failure state is active, any concurrent form validation error messages SHALL be suppressed; THE image URL field SHALL not be updated.

---

### Requirement 11: Storefront Dynamic Data Loading

**User Story:** As a customer, I want the product and hampers sections to always show the latest data so that I can order what is currently available.

#### Acceptance Criteria

1. WHEN the ProductSection component mounts, THE ProductSection SHALL fetch all Products from the Supabase database, replacing the static `products.json` import.
2. WHEN the HampersSection component mounts, THE HampersSection SHALL fetch all Hampers from the Supabase database, replacing the hardcoded `seasonalHampers` array.
3. WHILE the ProductSection data fetch is in progress, THE ProductSection SHALL display a loading skeleton or spinner in place of product cards; THE loading indicator SHALL be hidden as soon as the ProductSection fetch completes, regardless of whether the HampersSection fetch is still in progress.
4. WHILE the HampersSection data fetch is in progress, THE HampersSection SHALL display a loading skeleton or spinner in place of hamper cards; THE loading indicator SHALL be hidden as soon as the HampersSection fetch completes, regardless of whether the ProductSection fetch is still in progress.
5. IF the Supabase database query fails in ProductSection, THEN THE ProductSection SHALL display an error message indicating data could not be loaded, hide any loading indicator, and not render any product cards.
6. IF the Supabase database query fails in HampersSection, THEN THE HampersSection SHALL display an error message indicating data could not be loaded, hide any loading indicator, and not render any hamper cards.
7. IF the Supabase database query returns an empty result set in ProductSection, THEN THE ProductSection SHALL display an empty-state message rather than rendering nothing silently.
8. WHEN a product or hamper record is updated via the Admin_Dashboard, THE storefront sections SHALL reflect the updated data on the next page load or component mount without requiring a frontend code deployment.

---

### Requirement 12: Data Migration

**User Story:** As an admin, I want existing product and hamper data migrated to Supabase so that the storefront continues to show all current items from day one.

#### Acceptance Criteria

1. THE deployment SHALL include a migration script that, when executed once, upserts all products from `src/data/products.json` into the Supabase products table using each product's id as the conflict key, preserving correct categories (cookies and juice only), variants, ingredients, toppings, and isNew values; re-running the script SHALL not create duplicate records.
2. THE deployment SHALL include a migration script that, when executed once, upserts all hampers from the `seasonalHampers` array in `HampersSection.tsx` into the Supabase hampers table using each hamper's id as the conflict key, preserving id, name, description, price fields, images, rating, sales, seasonal tag, and whatsIncluded values; re-running the script SHALL not create duplicate records.
3. WHEN the migration script completes successfully, THE Supabase database SHALL contain one record per source item with matching id, all required fields populated, and a total record count equal to the number of items in the source data, so no product or hamper is missing from the storefront after migration.

---

### Requirement 13: Access Control and Security

**User Story:** As the business owner, I want to ensure that only authorized admins can make changes to product data so that the storefront is not accidentally or maliciously modified.

#### Acceptance Criteria

1. THE Supabase database SHALL enforce Row Level Security (RLS) policies on the products and hampers tables so that SELECT operations are permitted for all users (including unauthenticated), while INSERT, UPDATE, and DELETE operations are permitted only for authenticated users whose email is present in the admin allowlist.
2. THE Storage_Bucket SHALL be configured so that GET (read) operations on image files are permitted for all users, while POST and DELETE (upload and delete) operations require an authenticated Admin_User session.
3. WHEN the Admin_Dashboard performs any database write or storage upload operation, THE Supabase_Client SHALL use the authenticated Admin_User session token. IF the session token is expired, missing, or invalid, THEN THE Admin_Dashboard SHALL reject the write or upload operation, display an error message indicating the session is invalid, and not execute the database or storage operation.
4. THE Admin_Dashboard SHALL not expose Supabase service role keys or other privileged credentials in the client-side bundle; environment variables that are not prefixed with `VITE_` SHALL not be included in the compiled frontend assets.
