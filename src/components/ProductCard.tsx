import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [showImageModal, setShowImageModal] = useState(false);
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
      description: `${product.name} (${selectedVariant.size}) siap menikmati.`,
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
      className={`flex flex-col border border-[#a3e2f5]/30 rounded-3xl bg-white p-3 md:p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${className}`}
      onClick={(e) => {
        // Prevent all clicks from bubbling up to carousel or other components
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Prevent mouse events that might trigger unwanted interactions
        e.stopPropagation();
      }}
    >
      {/* TOP: image section */}
      <div className="relative mb-3 md:mb-4 group">
        <div
          className="w-full aspect-square rounded-2xl bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        {product.isNew && (
          <Badge className="absolute top-2 right-2 bg-[#D8CFF7] text-white text-[10px] px-2 py-0.5 shadow-md">
            NEW
          </Badge>
        )}
      </div>

      {/* BOTTOM: content section */}
      <div className="flex flex-col flex-1 space-y-2 md:space-y-3">
        {/* Title with View Item button */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base md:text-lg font-bold text-[#11110a] truncate leading-tight flex-1">
            {product.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              setShowImageModal(true);
              e.stopPropagation();
            }}
            className="text-[#553d8f] hover:text-[#553d8f] hover:bg-[#553d8f]/10 px-2 py-1 h-auto text-xs font-medium shrink-0"
          >
            Detail produk
          </Button>
        </div>

        {/* Price */}
        <div className="text-base md:text-lg font-semibold text-[#11110a]">
          Rp {selectedVariant.price.toLocaleString('id-ID')}
        </div>

        {/* Star rating and sales info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-[#11110a]">{productRating}</span>
          </div>
          <span className="text-sm text-[#11110a]/60">•</span>
          <span className="text-sm text-[#11110a]/60">terjual {productSales}</span>
        </div>

        {/* Size section - dropdown for multi-size, plain text for single-size */}
        <div 
          className="w-full"
          onClick={(e) => {
            // Prevent any click events from bubbling up from this entire section
            e.stopPropagation();
          }}
        >
          {/* <label className="text-[11px] font-semibold tracking-wide text-[#11110a]/85 mb-1.5 block">
            Size
          </label> */}

          {isMultiSize ? (
            /* Dropdown for multi-size products (cookies, macaroni) */
            <Select
              value={selectedVariantIndex.toString()}
              onValueChange={(value) => {
                setSelectedVariantIndex(parseInt(value));
              }}
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
                side="bottom"
                className="
                  z-[9999]
                  w-full
                  max-w-[280px]
                  max-h-[200px]
                  overflow-y-auto
                  rounded-2xl
                  border border-[#e5e7eb]
                  bg-white
                  shadow-lg
                  p-1.5
                  pointer-events-auto
                "
                onClick={(e) => {
                  // Prevent all clicks within the dropdown content from bubbling
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  // Prevent mouse events from passing through to content underneath
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseEnter={() => {
                  // Ensure dropdown captures all pointer events
                  // This prevents mouse events from leaking to underlying content
                }}
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
                          pointer-events-auto
                        "
                        onClick={(e) => {
                          // Ensure clicks don't pass through to underlying content
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onMouseDown={(e) => {
                          // Prevent mouse events from passing through
                          e.stopPropagation();
                          e.preventDefault();
                        }}
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
            <div className="flex items-center justify-center w-full h-8 rounded-full bg-[#D8CFF7] text-[#553d8f] text-[11px] font-semibold">
              {selectedVariant.size}
            </div>
          )}
        </div>

        {/* Bottom: Conditional UI - Beli button or Quantity controls */}
        <div 
          className="mt-auto pt-2"
          onClick={(e) => {
            // Prevent button clicks from bubbling to other elements
            e.stopPropagation();
          }}
        >
          {!hasItemInCart ? (
            /* Show Beli button when not in cart */
            <div className="w-full">
              <Button
                onClick={(e) => {
                  handleAddToCart();
                  e.stopPropagation();
                }}
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
                onClick={(e) => {
                  handleDecreaseQuantity();
                  e.stopPropagation();
                }}
                disabled={isAdding}
                className="h-10 w-10 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  handleIncreaseQuantity();
                  e.stopPropagation();
                }}
                disabled={isAdding}
                className="h-10 w-10 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-lg w-full aspect-square rounded-2xl p-0 sm:p-6 overflow-hidden [&>button]:hidden sm:[&>button]:block">
          {/* Mobile Header with bigger close button */}
          <div className="flex items-center justify-between p-4 sm:p-0 sm:hidden border-b">
            <DialogTitle className="text-lg font-bold text-[#11110a] pr-8">
              {product.name}
            </DialogTitle>
            <button
              onClick={() => setShowImageModal(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Desktop Header */}
          <DialogHeader className="hidden sm:flex flex-shrink-0 px-0">
            <DialogTitle className="text-lg font-bold text-[#11110a]">
              {product.name}
            </DialogTitle>
          </DialogHeader>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
            <div className="p-4 w-full box-border">
              <div className="space-y-1 md:space-y-3 w-full max-w-full">
                {/* Product Image - Responsive and Visible */}
                <div className="flex justify-center mb-4">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-gray-200">
                    <div
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="space-y-3 md:space-y-4 pb-4">
                  {/* Rating and Sales */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-[#11110a]">{productRating}</span>
                    </div>
                    <span className="text-sm text-[#11110a]/60">•</span>
                    <span className="text-sm text-[#11110a]/60">terjual {productSales}</span>
                  </div>
                  
                  {/* Price */}
                  <div className="text-lg font-bold text-[#11110a]">
                    Rp {selectedVariant.price.toLocaleString('id-ID')}
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#11110a]">Deskripsi Produk</h3>
                    <p className="text-sm text-[#11110a]/75 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  
                  {/* Size Info */}
                  <div className="space-y-2 w-full">
                    <h3 className="text-sm font-semibold text-[#11110a]">Pilihan Size</h3>
                    <div className="flex flex-wrap gap-2 w-full max-w-full">
                      {product.variants.map((variant, index) => {
                        const meta = getSizeMeta(variant.size);
                        return (
                          <Badge 
                            key={index} 
                            variant={index === selectedVariantIndex ? "default" : "secondary"}
                            className={`text-xs py-1 px-3 shrink-0 ${
                              index === selectedVariantIndex 
                                ? 'bg-[#553d8f] text-white hover:bg-[#553d8f]' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {meta.label && meta.label !== meta.code ? `${meta.code} - ${meta.label}` : meta.code}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ingredients */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="space-y-2 w-full">
                      <h3 className="text-sm font-semibold text-[#11110a]">Bahan-bahan</h3>
                      <div className="flex flex-wrap gap-1.5 w-full max-w-full">
                        {product.ingredients.map((ingredient, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="text-xs py-1 px-2 shrink-0 bg-[#f0f9ff] text-[#0c4a6e] hover:bg-[#f0f9ff]"
                          >
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toppings */}
                  {product.toppings && product.toppings.length > 0 && (
                    <div className="space-y-2 w-full">
                      <h3 className="text-sm font-semibold text-[#11110a]">Topping</h3>
                      <div className="flex flex-wrap gap-1.5 w-full max-w-full">
                        {product.toppings.map((topping, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="text-xs py-1 px-2 shrink-0 bg-[#fef3c7] text-[#92400e] hover:bg-[#fef3c7]"
                          >
                            {topping}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cup Information */}
                  {product.cupSize && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-[#11110a]">Cup Size</h3>
                      <div className="text-sm text-[#11110a]/75 leading-relaxed">
                        {product.cupSize}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
