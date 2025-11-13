# Tiny Bitty - WhatsApp Order Landing Page

A beautiful, mobile-first landing page for homemade treats (cookies, juice, macaroni schotel) with WhatsApp ordering integration.

## Features

- 🍪 **Product Browsing**: Display three categories with images, descriptions, sizes, and prices
- 🛒 **Shopping Cart**: Add items with variant selectors, adjust quantities, and persist cart in localStorage
- 📱 **WhatsApp Integration**: Submit orders directly via WhatsApp with formatted messages
- 🎨 **Playful Design**: Pastel color palette (peach, mint, lilac) with rounded corners and soft shadows
- 📦 **Order Form**: Collect customer details with validation (Zod)
- 🚀 **Zero Backend**: No database or payment gateway required

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom pastel theme
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Context API
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure WhatsApp Number**:
   Update the `WHATSAPP_NUMBER` constant in `src/components/OrderForm.tsx`:
   ```typescript
   const WHATSAPP_NUMBER = '6281112010160';
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Sticky header with logo and navigation
│   ├── Hero.tsx            # Hero section with CTA buttons
│   ├── ProductCard.tsx     # Individual product card with variant selector
│   ├── ProductSection.tsx  # Product category section wrapper
│   ├── CartSheet.tsx       # Slide-out cart with quantity controls
│   ├── OrderForm.tsx       # Order form with validation
│   ├── Footer.tsx          # Footer with social links
│   └── ui/                 # shadcn/ui components
├── contexts/
│   └── CartContext.tsx     # Cart state management
├── data/
│   └── products.json       # Product data
├── lib/
│   ├── validation.ts       # Zod schemas
│   ├── whatsapp.ts         # WhatsApp message builder
│   └── utils.ts            # Utility functions
└── types/
    └── product.ts          # TypeScript interfaces

```

## Customization

### Products
Edit `src/data/products.json` to add/modify products:
```json
{
  "id": "product-id",
  "name": "Product Name",
  "description": "Product description",
  "image": "https://...",
  "variants": [
    { "size": "Small", "price": 50000 }
  ],
  "isNew": true
}
```

### Colors
Modify Tailwind config or use CSS variables in `src/index.css` for custom colors.

### WhatsApp Message Format
Edit `src/lib/whatsapp.ts` to customize the message template.

## Deployment

Deploy to Vercel (recommended):
```bash
npm run build
# Deploy dist/ folder to Vercel
```

Or any static hosting service (Netlify, GitHub Pages, etc.)

## License

MIT