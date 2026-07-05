-- =============================================================
-- Tiny Bitty Admin Dashboard — Supabase Setup SQL
-- Run this entire file in the Supabase SQL Editor
-- =============================================================

-- -----------------------------------------------
-- TASK 1.1: Create products and hampers tables
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL CHECK (category IN ('cookies', 'juice')),
  image        TEXT NOT NULL DEFAULT '',
  variants     JSONB NOT NULL DEFAULT '[]',
  ingredients  JSONB NOT NULL DEFAULT '[]',
  toppings     JSONB NOT NULL DEFAULT '[]',
  is_new       BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hampers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  image            TEXT NOT NULL DEFAULT '',
  images           JSONB NOT NULL DEFAULT '[]',
  price            INTEGER,
  hamper_variants  JSONB NOT NULL DEFAULT '[]',
  rating           NUMERIC(3,1) NOT NULL DEFAULT 0.0,
  sales            TEXT NOT NULL DEFAULT '',
  seasonal         TEXT NOT NULL DEFAULT '',
  whats_included   JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hampers_updated_at ON hampers;
CREATE TRIGGER update_hampers_updated_at
  BEFORE UPDATE ON hampers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------
-- TASK 1.2: Row Level Security policies
-- -----------------------------------------------

-- Products RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_admin_write" ON products
  FOR ALL
  USING (
    auth.email() IN (
      'tinybitty.tb@gmail.com'
      -- Add more admin emails here as comma-separated strings
    )
  )
  WITH CHECK (
    auth.email() IN (
      'tinybitty.tb@gmail.com'
    )
  );

-- Hampers RLS
ALTER TABLE hampers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hampers_public_read" ON hampers;
CREATE POLICY "hampers_public_read" ON hampers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "hampers_admin_write" ON hampers;
CREATE POLICY "hampers_admin_write" ON hampers
  FOR ALL
  USING (auth.email() IN ('tinybitty.tb@gmail.com'))
  WITH CHECK (auth.email() IN ('tinybitty.tb@gmail.com'));

-- -----------------------------------------------
-- Storage bucket policies (product-images)
-- NOTE: First create the bucket in the Supabase
-- Storage UI (set to Public), then run these policies.
-- -----------------------------------------------

DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
CREATE POLICY "storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "storage_admin_upload" ON storage.objects;
CREATE POLICY "storage_admin_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.email() IN ('tinybitty.tb@gmail.com')
  );

DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.email() IN ('tinybitty.tb@gmail.com')
  );
