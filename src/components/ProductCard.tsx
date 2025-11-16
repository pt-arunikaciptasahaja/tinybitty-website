import { useState } from 'react';
import { Product } from '@/types/product';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Minus, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const selectedVariant = product.variants[selectedVariantIndex];
  const isMultiSize = product.variants.length > 1;


  const handleAddToCart = () => {
    setIsAdding(true);

    addToCart({
      productId: product.id,
      productName: product.name,
      variant: selectedVariant,
      quantity,
      image: product.image,
    });

    toast({
      title: 'Added to cart! 🎉',
      description: `${quantity}x ${product.name} (${selectedVariant.size})`,
    });

    setQuantity(1);

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const getSizeMeta = (size: string) => {
    const s = size.toLowerCase();
  
    // 🔹 For cookies with grams (Large 400gr, Medium 150gr, etc)
    if (/g[r]?/i.test(size)) {
      // Extract grams
      const gramsMatch = size.match(/(\d+\s?g[r]?)/i);
      const grams = gramsMatch ? gramsMatch[1].replace(/\s+/g, '') : '';
      
      // Determine size code (L, M, S, Mini)
      let code = '';
      let badgeClass = '';
      
      if (s.includes('mini')) {
        code = 'Mini';
        badgeClass = 'bg-[#ffe4f0] text-[#b83263]';
      } else if (s.startsWith('s') || s.includes('small')) {
        code = 'S';
        badgeClass = 'bg-[#e0f2fe] text-[#0369a1]';
      } else if (s.startsWith('m') || s.includes('medium')) {
        code = 'M';
        badgeClass = 'bg-[#dcfce7] text-[#166534]';
      } else if (s.startsWith('l') || s.includes('large')) {
        code = 'L';
        badgeClass = 'bg-[#fef9c3] text-[#854d0e]';
      }
      
      return {
        code: code,               // badge: L / M / S / Mini
        label: grams,             // label: "400gr", "150gr", etc
        badgeClass: badgeClass,
      };
    }
    
    // 🔹 For "2 pcs", "4 pcs", etc (macaroni)
    if (s.includes('pcs')) {
      const numMatch = size.match(/\d+/);
      const num = numMatch ? numMatch[0] : size.charAt(0);
  
      return {
        code: num,                // badge: 2 / 4 / 9
        label: 'pcs',             // label: "pcs"
        badgeClass: 'bg-[#e0f2fe] text-[#1d4ed8]',
      };
    }
  
    // fallback for other sizes (like juice "250ml")
    return {
      code: size,                 // show full size for single-size products
      label: size,
      badgeClass: 'bg-gray-100 text-gray-700',
    };
  };
  


  return (
    <Card
      className={`flex items-stretch gap-3 md:gap-4 border border-[#a3e2f5]/30 rounded-3xl bg-white p-3 md:p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${className}`}
    >
      {/* LEFT: image + qty at bottom */}
      <div className="relative flex flex-col justify-between items-center flex-shrink-0">
        <div
          className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-[#ffa101] text-white text-[10px] px-2 py-0.5 shadow-md">
            NEW
          </Badge>
        )}

        {/* Qty below image */}
        <div className="mt-2">
          <label className="text-[11px] font-medium text-[#11110a]/80 mb-1 block text-center">
            Qty
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-base font-semibold w-8 text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT: title, price, desc, size, button */}
      <div className="flex flex-col flex-1 justify-between min-w-0">
        {/* Top text & controls */}
        <div className="space-y-1.5 mb-2 flex-1 overflow-hidden">
          <h3 className="text-base md:text-lg font-bold text-[#11110a] truncate">
            {product.name}
          </h3>

          {/* Price directly under title */}
          <div className="text-base md:text-lg font-semibold text-[#11110a]">
            Rp {selectedVariant.price.toLocaleString('id-ID')}
          </div>

          <p className="text-sm md:text-[15px] text-[#11110a]/75 line-clamp-2 leading-tight">
            {product.description}
          </p>

          {/* Size section - dropdown for multi-size, plain text for single-size */}
          <div className="mt-2">
            <label className="text-[11px] font-semibold tracking-wide text-[#11110a]/85 mb-1.5 block">
              Size
            </label>

            {isMultiSize ? (
              /* Dropdown for multi-size products (cookies, macaroni) */
              <Select
                value={selectedVariantIndex.toString()}
                onValueChange={(value) => setSelectedVariantIndex(parseInt(value))}
              >
                <SelectTrigger
                  className="
                    w-full h-10
                    rounded-full
                    border border-[#e5e7eb]
                    bg-[#f9fafb]
                    px-3
                    text-xs
                    flex items-center justify-between gap-2
                    shadow-none
                    ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0
                    data-[state=open]:bg-white
                    data-[state=open]:border-[#a3e2f5]
                    transition-colors
                  "
                >
                  <SelectValue placeholder="Pilih ukuran" />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  side="top"
                  sideOffset={6}
                  className="
                    z-50
                    max-w-[280px]
                    rounded-2xl
                    border border-[#e5e7eb]
                    bg-white
                    shadow-lg
                    p-1.5
                  "
                >

                  {product.variants.map((variant, index) => {
                      const meta = getSizeMeta(variant.size);

                      return (
                        <SelectItem
                          key={index}
                          value={index.toString()}
                          className="
                            text-xs
                            py-1.5 px-2
                            rounded-full
                            data-[state=checked]:bg-[#e0f2fe]
                            data-[state=checked]:text-[#0f172a]
                            data-[highlighted]:bg-[#f3f4f6]
                            data-[highlighted]:text-[#111827]
                            cursor-pointer
                            focus:bg-[#f3f4f6]
                            focus:text-[#111827]
                          "
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Size icon pill */}
                            <div
                              className={`
                                flex items-center justify-center
                                w-7 h-7
                                rounded-full
                                text-[11px] font-semibold
                                ${meta.badgeClass}
                              `}
                            >
                              {meta.code}
                            </div>

                            {/* Texts - for cookies show only grams, for macaroni show only number */}
                            <div className="flex flex-col leading-tight">
                              <span className="text-[13px] font-semibold text-[#11110a]">
                                {meta.label}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}

                </SelectContent>
              </Select>
            ) : (
              /* Plain text for single-size products (juice) */
              <div className="flex items-center justify-center w-16 h-8 rounded-full bg-[#e0f2fe] text-[#1d4ed8] text-[11px] font-semibold">
                {selectedVariant.size}
              </div>
            )}
          </div>

        </div>

        {/* Bottom: Beli button aligned with qty bottom */}
        <div className="flex items-center justify-end mt-2 flex-shrink-0">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="rounded-full px-6 md:px-8 py-2 md:py-2.5 text-sm md:text-base font-semibold bg-[#553d8f] hover:bg-[#553d8f] text-white shadow-md relative overflow-hidden whitespace-nowrap"
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                Added!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Beli
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}