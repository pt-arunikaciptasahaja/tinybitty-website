/**
 * scripts/seed.mjs — One-time data migration script
 *
 * Seeds products (cookies + juice) and hampers from static sources into Supabase.
 * Uses the service role key — NEVER commit real key values to version control.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// -----------------------------------------------
// Config — from environment, never from VITE_ vars
// -----------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing environment variables.\n' +
    'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// -----------------------------------------------
// Load products from products.json
// -----------------------------------------------
const productsJson = JSON.parse(
  readFileSync(join(__dirname, '../src/data/products.json'), 'utf-8')
);

/** @param {string} category */
function mapProducts(category) {
  const items = productsJson[category] ?? [];
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    category,
    image: item.image ?? '',
    variants: item.variants ?? [],
    ingredients: item.ingredients ?? [],
    toppings: item.toppings ?? [],
    is_new: item.isNew ?? false,
  }));
}

const productRows = [
  ...mapProducts('cookies'),
  ...mapProducts('juice'),
];

// -----------------------------------------------
// Hamper data (extracted from HampersSection)
// -----------------------------------------------
const hamperRows = [
  {
    id: 'eid-1',
    name: 'Eid Hampers A',
    description:
      'A simple, wholesome treat made with Medjool dates, oats, and sliced almonds. Naturally sweet, lightly crunchy, and perfectly comforting in every bite. Beautifully packed and ideal for gifting or enjoying anytime.',
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068682/ChatGPT_Image_Feb_14_2026_06_30_55_PM_ouyqsr.png',
    images: [
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068682/ChatGPT_Image_Feb_14_2026_06_30_55_PM_ouyqsr.png',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/b_rgb:FFFFFF/v1771161737/ChatGPT_Image_Feb_8_2026_07_47_22_PM_s3tqf3.png',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/f_png/v1770741397/IMG_9066_b1xkzv.jpg',
    ],
    price: 90000,
    hamper_variants: [],
    rating: 5.0,
    sales: '89+',
    seasonal: 'Eid Collection',
    whats_included: ['1 cookie jar', '2 Greeting cards', 'Gift box'],
  },
  {
    id: 'eid-2',
    name: 'Eid Hampers B',
    description:
      'A charming cookie hamper filled with our signature wholesome cookies, beautifully presented for gifting. Comes with two greeting cards, a decorative ribbon, and an elegant gift box.',
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1770745549/Gemini_Generated_Image_ulp3txulp3txulp3_nxct9q.png',
    images: [
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771162612/ChatGPT_Image_Feb_8_2026_08_08_11_PM_vbvevz.png',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/f_png/v1770745549/Gemini_Generated_Image_ulp3txulp3txulp3_nxct9q.png',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/b_rgb:FFFFFF/v1771163442/ChatGPT_Image_Feb_15_2026_08_50_18_PM_pnawg9.png',
    ],
    price: 195000,
    hamper_variants: [],
    rating: 4.9,
    sales: '156+',
    seasonal: 'Eid Collection',
    whats_included: ['2 cookie jars', '2 greeting cards', 'Decorative ribbon', 'Gift box'],
  },
  {
    id: 'eid-3',
    name: 'Eid Hampers C',
    description:
      'A thoughtfully curated cookie hamper, beautifully presented and ready to gift. This set includes our signature cookies, two greeting cards, a decorative ribbon, an elegant gift box, and a premium paper bag.',
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1770746119/Gemini_Generated_Image_wl95zjwl95zjwl95_jgqfln.png',
    images: [
      'https://res.cloudinary.com/dodmwwp1w/image/upload/b_rgb:FFFFFF/v1771163753/ChatGPT_Image_Feb_8_2026_06_51_51_PM_x2dqrt.png',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/a_-90/f_png/v1770741362/IMG_9053_x2asbo.jpg',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/f_png/v1770741410/IMG_9078_frorxs.jpg',
    ],
    price: 375000,
    hamper_variants: [],
    rating: 4.8,
    sales: '67+',
    seasonal: 'Eid Collection',
    whats_included: ['3 cookie jars', '2 greeting cards', 'Decorative ribbon', 'Gift box', 'Premium paper bag'],
  },
  {
    id: 'eid-d',
    name: 'Eid Hampers D',
    description:
      'Customizable Eid hampers that you can fill with either three or five tiny juices, or two 100-gram pouches of cookies. Perfect for gifting, sharing, or treating yourself during Eid celebrations.',
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771417485/Gemini_Generated_Image_wy61y7wy61y7wy61_nbjspy.png',
    images: [
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771417485/Gemini_Generated_Image_wy61y7wy61y7wy61_nbjspy.png',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771418738/yupp-generated-image-855171_gjo9aa.png',
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771164684/sg-11134201-22100-3gvh6ej7a5iv2a_e3xqqx.webp',
    ],
    price: null,
    hamper_variants: [
      { name: '2x 30gr pouches', price: 65000 },
      { name: '3 juices', price: 85000 },
      { name: '5 juices', price: 125000 },
    ],
    rating: 4.9,
    sales: '78+',
    seasonal: 'Eid Collection',
    whats_included: [
      'Choice of: 3 or 5 tiny juices OR 2x 100g cookie pouches',
      'Packaging bag',
      '2 ice packs',
      '2 Greeting cards',
    ],
  },
];

// -----------------------------------------------
// Run upserts
// -----------------------------------------------
async function seed() {
  console.log(`\n🌱 Seeding ${productRows.length} products…`);
  const { error: prodErr, count: prodCount } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'id', count: 'exact' });

  if (prodErr) {
    console.error('❌ Products upsert failed:', prodErr.message);
    process.exit(1);
  }
  console.log(`✅ Products upserted (${prodCount ?? productRows.length} records)`);

  console.log(`\n🌱 Seeding ${hamperRows.length} hampers…`);
  const { error: hamperErr, count: hamperCount } = await supabase
    .from('hampers')
    .upsert(hamperRows, { onConflict: 'id', count: 'exact' });

  if (hamperErr) {
    console.error('❌ Hampers upsert failed:', hamperErr.message);
    process.exit(1);
  }
  console.log(`✅ Hampers upserted (${hamperCount ?? hamperRows.length} records)`);

  console.log('\n🎉 Seed complete!\n');
}

seed().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
