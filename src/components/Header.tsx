import { Instagram, MessageCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#f5fbf8] backdrop-blur-sm border-b border-[#a3e2f5]/20 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logotiny.png"
              alt="Tiny Bitty - Freshly Baked Happiness"
              className="h-20 md:h-28 w-auto object-contain"
              style={{
                filter: 'invert(20%) sepia(100%) saturate(3000%) hue-rotate(255deg) brightness(0.6) contrast(1.8)'
              }}
            />
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="#products"
              className="hidden md:inline-block text-sm font-medium text-[#11110a] hover:text-[#553d8f] transition-colors"
            >
              Products
            </a>
            <a
              href="#order"
              className="hidden md:inline-block text-sm font-medium text-[#11110a] hover:text-[#553d8f] transition-colors"
            >
              Order
            </a>
            <a
              href="https://instagram.com/tiny.bitty/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#553d8f] hover:text-[#553d8f]/80 transition-colors"
            >
              <Instagram className="w-10 h-10 stroke-2 fill: var(--color-red-600)" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}