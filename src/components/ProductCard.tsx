import { useState, useEffect } from 'react';
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
import { Plus, Minus, Check, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, updateQuantity, removeFromCart, cart } = useCart();
  const { toast } = useToast();

  const selectedVariant = product.variants[selectedVariantIndex];
  const isMultiSize = product.variants.length > 1;
  const quantity = quantities[selectedVariantIndex] || 0;
  const hasItemInCart = quantity > 0;

  // Dynamic rating and sales based on product name
  const getProductRating = (productName: string) => {
    const name = productName.toLowerCase();
    
    // Best sellers get higher ratings
    if (name.includes('choco almond')) return 4.9;
    if (name.includes('soursop') || name.includes('sirsak')) return 4.8;
    if (name.includes('macaroni')) return 4.8;
    
    // Other products have slightly lower ratings
    return 4.5;
  };

  const getProductSales = (productName: string) => {
    const name = productName.toLowerCase();
    
    // Best sellers have higher sales
    if (name.includes('choco almond')) return '245+';
    if (name.includes('soursop') || name.includes('sirsak')) return '189+';
    if (name.includes('macaroni')) return '312+';
    
    // Other products have varied, distinct sales
    if (name.includes('chocolate')) return '156+';
    if (name.includes('vanilla')) return '134+';
    if (name.includes('strawberry')) return '98+';
    if (name.includes('cheese')) return '167+';
    if (name.includes('orange')) return '112+';
    if (name.includes('apple')) return '87+';
    if (name.includes('mango')) return '143+';
    
    // Fallback for any other products
    return '75+';
  };

  const productRating = getProductRating(product.name);
  const productSales = getProductSales(product.name);

  // Sync component quantity state with actual cart state
  useEffect(() => {
    const cartItem = cart.find(
      item => item.productId === product.id && item.variant.size === selectedVariant.size
    );
    
    if (cartItem) {
      setQuantities(prev => ({
        ...prev,
        [selectedVariantIndex]: cartItem.quantity
      }));
    } else {
      setQuantities(prev => ({
        ...prev,
        [selectedVariantIndex]: 0
      }));
    }
  }, [cart, product.id, selectedVariant.size, selectedVariantIndex]);

  const handleAddToCart = () => {
    setIsAdding(true);

    addToCart({
      productId: product.id,
      productName: product.name,
      variant: selectedVariant,
      quantity: 1,
      image: product.image,
    });

    setQuantities(prev => ({
      ...prev,
      [selectedVariantIndex]: 1
    }));

    toast({
      title: 'Yeay, berhasil! ✨',
      description: `${product.name} (${selectedVariant.size}) siap dinikmati.`,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantities(prev => ({
      ...prev,
      [selectedVariantIndex]: newQuantity
    }));
    
    updateQuantity(product.id, selectedVariant.size, newQuantity);

    toast({
      title: 'Jumlah diganti 😋',
      description: `${newQuantity}x ${product.name} (${selectedVariant.size}) siap lanjut!`,
    });
  };

  const handleDecreaseQuantity = () => {
    const newQuantity = Math.max(0, quantity - 1);
    setQuantities(prev => ({
      ...prev,
      [selectedVariantIndex]: newQuantity
    }));
    
    updateQuantity(product.id, selectedVariant.size, newQuantity);
  
    if (newQuantity === 0) {
      toast({
        title: 'Dihapus dari keranjang',
        description: `${product.name} (${selectedVariant.size})`,
      });
    } else {
      toast({
        title: 'Jumlah diperbarui',
        description: `${newQuantity}x ${product.name} (${selectedVariant.size})`,
      });
    }
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
        code = 'Mn';
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
        badgeClass: 'bg-[#F6F2FF] text-[#553d8f]',
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
      className={`flex items-stretch gap-3 md:gap-4 border border-[#a3e2f5]/30 rounded-3xl bg-white p-3 md:p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden -mx-[7px] md:mx-0 w-[calc(100%+14px)] md:w-full ${className}`}
    >
      {/* LEFT: image + qty at bottom */}
      <div className="relative flex flex-col justify-between items-center flex-shrink-0">
        <div
          className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-[#D8CFF7] text-white text-[10px] px-2 py-0.5 shadow-md">
            NEW
          </Badge>
        )}

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

          {/* Star rating and sales info */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-[#11110a]">{productRating}</span>
            </div>
            <span className="text-sm text-[#11110a]/60">•</span>
            <span className="text-sm text-[#11110a]/60">terjual {productSales}</span>
          </div>

          <p className="text-sm md:text-[15px] text-[#11110a]/75 line-clamp-2 leading-tight">
            {product.description}
          </p>

          {/* Size section - dropdown for multi-size, plain text for single-size */}
          <div className="w-full mt-2">
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
                  sideOffset={8}
                  align="start"
                  collisionPadding={{ top: 60, bottom: 40 }}
                  className="
                    z-50
                    w-full
                    max-w-[280px]
                    max-h-[200px]
                    overflow-y-auto
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
                                w-7 h-7 md:w-7 md:h-7
                                rounded-full
                                text-[9px] md:text-[11px] font-semibold
                                ${meta.badgeClass}
                                min-w-[24px]
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
              /* Plain text for single-size products (juice) - now full width too */
              <div className="flex items-center justify-center w-full h-8 rounded-full bg-[#F6F2FF] text-[#553d8f] text-[10px] md:text-[11px] font-semibold">
                {selectedVariant.size}
              </div>
            )}
          </div>

        </div>

        {/* Bottom: Conditional UI - Beli button or Quantity controls */}
        <div className="mt-2 flex-shrink-0">
          {!hasItemInCart ? (
            /* Show Beli button when not in cart */
            <div className="w-full">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full rounded-full px-6 md:px-8 py-2 md:py-2.5 text-sm md:text-base font-semibold bg-[#553d8f] hover:bg-[#553d8f] text-white shadow-md relative overflow-hidden whitespace-nowrap"
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
          ) : (
            /* Show quantity controls when in cart */
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecreaseQuantity}
                disabled={isAdding}
                className="h-11 w-11 md:h-10 md:w-10 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncreaseQuantity}
                disabled={isAdding}
                className="h-11 w-11 md:h-10 md:w-10 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}