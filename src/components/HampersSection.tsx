import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Minus, Check, Star } from 'lucide-react';
import { fbPixelTrack } from '@/lib/fbpixel';
import SnowAnimation from './SnowAnimation';

// Seasonal hamper data with Christmas theme
const seasonalHampers = [
  {
    id: 'christmas-1',
    name: 'The Cookie Quartet Box',
    description: 'A super-cute bundle of joy! Four jars of our best-selling cookies all snuggled together in one adorable hamper. Comes with all flavors (Cheese Almond, Heavenly Bites, Oatmeal Raisin, Choco Almond) + a sweet little greeting card. Perfect for gifting… or keeping for yourself 😌✨',
    price: 350000,
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693066/yupp-generated-image-497742_zdaako.jpg',
    rating: 5.0,
    sales: '89+',
    seasonal: 'Limited Collection',
    // isNew: true
  },
  {
    id: 'christmas-2',
    name: 'The Sweet Duo Box',
    description: 'Two jars, double the happiness! Mix and match your fave cookie flavors and gift it with love. Comes with a greeting card that makes it extra thoughtful 💛 Perfect for quick gifting or tiny treats.',
    price: 180000,
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-570797_ekp6hg.jpg',
    rating: 4.9,
    sales: '156+',
    seasonal: 'Limited Collection',
    // isNew: true
  },
  {
    id: 'christmas-3',
    name: 'Tiny Treat Jar Gift',
    description: 'A cute little surprise that never fails! One jar of your chosen cookie flavor + a greeting card tucked inside. Simple, sweet, and guaranteed to make someone smile!',
    price: 90000,
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-565543_ukqomr.jpg',
    rating: 4.8,
    sales: '67+',
    seasonal: 'Limited Collection',
    // isNew: true
  },
  {
    id: 'newyear-1',
    name: 'Chilly Juice Bag Set',
    description: 'Juicy, chilly, and oh-so-fun! Our Tiny Bitty Juice Hamper comes in an adorable insulated flap bag, complete with 2 ice packs to keep everything cool. Pick your size: Large (7 juices) or Small (3 juices) — both include a greeting card for that extra holiday sparkle 🧃✨',
    price_large: 170000,
    price_small: 90000,
    image: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764743725/yupp-generated-image-664995_1_vgsoen.jpg',
    rating: 4.9,
    sales: '78+',
    seasonal: 'Limited Collection',
    // isNew: true
  }
];

function HamperCard({ hamper }: { hamper: typeof seasonalHampers[0] }) {
  const [selectedSize, setSelectedSize] = useState<'small' | 'large'>('small');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  const { addToCart, updateQuantity, cart } = useCart();
  const { toast } = useToast();

  const isJuiceHamper = hamper.price_large && hamper.price_small;
  const currentPrice = isJuiceHamper 
    ? (selectedSize === 'small' ? hamper.price_small : hamper.price_large)
    : hamper.price;
  const quantity = quantities[selectedSize] || 0;
  const hasItemInCart = quantity > 0;

  // Enhanced toast and tracking helpers like ProductCard
  const TOAST_SUCCESS_DURATION = 3000;

  // Facebook Pixel tracking helper
  const trackAddToCartEvent = useCallback(async () => {
    try {
      const pixelData = {
        content_ids: [hamper.id],
        content_name: hamper.name,
        content_type: 'product',
        currency: 'IDR',
        value: currentPrice,
        content_variant: isJuiceHamper ? `${selectedSize} juice hamper` : 'standard',
      };

      await fbPixelTrack('AddToCart', pixelData);
    } catch (error) {
      console.warn('❌ [FB PIXEL] Failed to track AddToCart event:', error);
    }
  }, [hamper, currentPrice, selectedSize, isJuiceHamper]);

  // Optimized toast helper
  const showSuccessToast = useCallback(() => {
    toast({
      title: 'Yeay, berhasil! ✨',
      description: `${hamper.name} (${isJuiceHamper ? `${selectedSize} juice hamper` : 'standard'}) siap dinikmati.`,
      duration: TOAST_SUCCESS_DURATION,
    });
  }, [toast, hamper.name, selectedSize, isJuiceHamper]);

  // Error toast helper
  const showErrorToast = useCallback((error: string) => {
    toast({
      title: 'Gagal menambahkan ke keranjang',
      description: error,
      variant: 'destructive',
    });
  }, [toast]);

  // Core add to cart logic with proper error handling
  const addToCartOperation = useCallback(async () => {
    try {
      if (!currentPrice) {
        showErrorToast('Harga produk tidak valid');
        setIsAdding(false);
        return;
      }

      const variant = isJuiceHamper 
        ? { size: `${selectedSize} juice hamper`, price: currentPrice }
        : { size: 'standard', price: currentPrice };

      addToCart({
        productId: hamper.id,
        productName: hamper.name,
        variant,
        quantity: 1,
        image: hamper.image,
      });

      setQuantities(prev => ({
        ...prev,
        [selectedSize]: 1
      }));

      showSuccessToast();
      trackAddToCartEvent();

    } catch (error) {
      console.error('Add to cart failed:', error);
      showErrorToast('Terjadi kesalahan saat menambahkan produk ke keranjang');
    } finally {
      setIsAdding(false);
    }
  }, [currentPrice, selectedSize, isJuiceHamper, hamper, addToCart, showSuccessToast, showErrorToast, trackAddToCartEvent]);

  // Main handler with performance optimizations
  const handleAddToCart = useCallback(async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    
    try {
      await addToCartOperation();
    } catch (error) {
      console.error('Unexpected error in handleAddToCart:', error);
      showErrorToast('Terjadi kesalahan yang tidak terduga');
      setIsAdding(false);
    }
  }, [isAdding, addToCartOperation, showErrorToast]);

  // Enhanced quantity handlers with better error handling
  const handleIncreaseQuantity = useCallback(() => {
    const newQuantity = quantity + 1;
    const variant = isJuiceHamper 
      ? { size: `${selectedSize} juice hamper`, price: currentPrice }
      : { size: 'standard', price: currentPrice };

    try {
      setQuantities(prev => ({
        ...prev,
        [selectedSize]: newQuantity
      }));
      
      updateQuantity(hamper.id, variant.size, newQuantity);

      toast({
        title: 'Jumlah diganti 😋',
        description: `${newQuantity}x ${hamper.name} (${variant.size}) siap lanjut!`,
        duration: TOAST_SUCCESS_DURATION,
      });
    } catch (error) {
      console.error('Failed to increase quantity:', error);
      toast({
        title: 'Gagal memperbarui jumlah',
        description: 'Silakan coba lagi',
        variant: 'destructive',
      });
    }
  }, [quantity, selectedSize, currentPrice, isJuiceHamper, hamper.id, hamper.name, updateQuantity, toast]);

  const handleDecreaseQuantity = useCallback(() => {
    const newQuantity = Math.max(0, quantity - 1);
    const variant = isJuiceHamper 
      ? { size: `${selectedSize} juice hamper`, price: currentPrice }
      : { size: 'standard', price: currentPrice };

    try {
      setQuantities(prev => ({
        ...prev,
        [selectedSize]: newQuantity
      }));
      
      updateQuantity(hamper.id, variant.size, newQuantity);
    
      if (newQuantity === 0) {
        toast({
          title: 'Dihapus dari keranjang',
          description: `${hamper.name} (${variant.size}) berhasil dihapus.`,
          duration: TOAST_SUCCESS_DURATION,
        });
      } else {
        toast({
          title: 'Jumlah diperbarui',
          description: `${newQuantity}x ${hamper.name} (${variant.size})`,
          duration: TOAST_SUCCESS_DURATION,
        });
      }
    } catch (error) {
      console.error('Failed to decrease quantity:', error);
      toast({
        title: 'Gagal memperbarui jumlah',
        description: 'Silakan coba lagi',
        variant: 'destructive',
      });
    }
  }, [quantity, selectedSize, currentPrice, isJuiceHamper, hamper.id, hamper.name, updateQuantity, toast]);

  // Sync component quantity state with actual cart state
  useEffect(() => {
    const variant = isJuiceHamper 
      ? { size: `${selectedSize} juice hamper`, price: currentPrice }
      : { size: 'standard', price: currentPrice };
    
    const cartItem = cart.find(
      item => item.productId === hamper.id && item.variant.size === variant.size
    );
    
    if (cartItem) {
      setQuantities(prev => ({
        ...prev,
        [selectedSize]: cartItem.quantity
      }));
    } else {
      setQuantities(prev => ({
        ...prev,
        [selectedSize]: 0
      }));
    }
  }, [cart, hamper.id, selectedSize, isJuiceHamper, currentPrice]);

  return (
    <>
      <Card
        className={`flex flex-col border border-[#a3e2f5]/30 rounded-3xl bg-white p-3 md:p-4transition-shadow duration-300 overflow-hidden mx-auto min-h-[494.5px] max-h-[600px]`}
        style={{ width: '281.96px' }}
        onClick={(e) => {
          // Prevent all clicks from bubbling up to carousel or other components
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          // Prevent mouse events that might trigger unwanted interactions
          e.stopPropagation();
        }}
      >
        {/* TOP: image section - Fixed consistent size */}
        <div className="relative mb-3 md:mb-4 group flex-shrink-0">
          <div
            className="w-full h-48 md:h-56 rounded-2xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${hamper.image})` }}
          />
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fff5f5] text-[#d26969] border shadow-md backdrop-blur-sm">
              {hamper.seasonal}
            </span>
          </div>
          <div className="absolute bottom-2 left-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                setShowDetailModal(true);
                e.stopPropagation();
              }}
              className="text-[#553d8f] hover:text-[#553d8f] hover:bg-[#553d8f]/10 px-2 py-1 h-auto text-[11px] font-medium shrink-0 bg-white/90 backdrop-blur-sm border border-[#553d8f]/20 shadow-md"
            >
              Detail produk
            </Button>
          </div>
        </div>

        {/* BOTTOM: content section - Full featured */}
        <div className="flex flex-col flex-1 space-y-2 md:space-y-3">
          {/* Title */}
          <h3 className="text-sm md:text-base font-bold text-[#11110a] truncate leading-tight">
            {hamper.name}
          </h3>

          {/* Price */}
          <div className="text-sm md:text-base font-semibold text-[#11110a]">
            Rp {currentPrice?.toLocaleString('id-ID')}
          </div>

          {/* What's included preview */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#11110a]/80">What's Included:</span>
            </div>
            <ul className="text-xs text-[#11110a]/70 space-y-0.5">
            {isJuiceHamper ? (
                        <>
                          <li>• {selectedSize === 'small' ? '3' : '7'} refreshing juices</li>
                          <li>• Insulated flap bag</li>
                          <li>• 2 ice packs</li>
                          <li>• Greeting card</li>
                        </>
                      ) : (
                        <>
                          <li>• Cookie jars per variant</li>
                          <li>• Greeting card</li>
                          <li>• Special packaging</li>
                        </>
                      )}
            </ul>
          </div>

          {/* Spacer to match height - cookie hampers have 3 items, juice has 4 */}
          {!isJuiceHamper && (
            <div className="h-6"></div>
          )}

          {/* Size section - Consistent height for all hampers */}
          <div className={`w-full h-10 md:h-10 flex items-center mb-1 ${!isJuiceHamper ? 'mt-3' : ''}`}>
            {isJuiceHamper ? (
              /* Dropdown for multi-size products (juice hampers) */
              <Select
                value={selectedSize}
                onValueChange={(value) => {
                  setSelectedSize(value as 'small' | 'large');
                }}
              >
                <SelectTrigger
                  className="
                    w-full h-full
                    rounded-full
                    border border-[#e5e7eb]
                    bg-[#f9fafb]
                    px-3 md:px-4
                    text-sm
                    flex items-center justify-between gap-2
                    shadow-none
                    ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0
                    data-[state=open]:bg-white
                    data-[state=open]:border-[#C5B8FF]
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
                    border border-[#C5B8FF]
                    bg-white
                    shadow-lg
                    p-2
                    will-change-transform
                    scrollbar-thin scrollbar-thumb-[#C5B8FF] scrollbar-track-transparent
                  "
                >
                  <SelectItem
                    value="small"
                    className="
                      text-sm
                      py-2 px-3
                      rounded-xl
                      bg-white
                      data-[state=checked]:bg-[#e9d5ff]
                      data-[state=checked]:text-[#581c87]
                      data-[highlighted]:bg-[#f8f9fa]
                      data-[highlighted]:text-[#581c87]
                      cursor-pointer
                      focus:bg-[#f8f9fa]
                      focus:text-[#581c87]
                      hover:bg-[#f8f9fa]
                      hover:text-[#581c87]
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1]">
                        S
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-[#11110a]">
                          3 juices
                        </span>
                      </div>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value="large"
                    className="
                      text-sm
                      py-2 px-3
                      rounded-xl
                      bg-white
                      data-[state=checked]:bg-[#e9d5ff]
                      data-[state=checked]:text-[#581c87]
                      data-[highlighted]:bg-[#f8f9fa]
                      data-[highlighted]:text-[#581c87]
                      cursor-pointer
                      focus:bg-[#f8f9fa]
                      focus:text-[#581c87]
                      hover:bg-[#f8f9fa]
                      hover:text-[#581c87]
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold bg-[#fef9c3] text-[#854d0e]">
                        L
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-[#11110a]">
                          7 juices
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              /* Plain text for single-size products (cookie hampers) */
              <div className="flex items-center justify-center w-full h-full rounded-full bg-[#D8CFF7] text-[#553d8f] text-sm font-semibold px-3 md:px-4">
                Standard Size
              </div>
            )}
          </div>

          {/* Bottom: Conditional UI - Beli button or Quantity controls */}
          <div 
            className="mt-auto pt-0"
            onClick={(e) => {
              // Prevent button clicks from bubbling to other elements
              e.stopPropagation();
            }}
          >
            {!hasItemInCart ? (
              /* Show Beli button when not in cart */
              <div className="w-full h-10 md:h-12 flex items-center justify-center">
                <Button
                  onClick={(e) => {
                    handleAddToCart();
                    e.stopPropagation();
                  }}
                  disabled={isAdding || !currentPrice}
                  className="w-full rounded-full px-3 md:px-8 py-1 md:py-2.5 text-sm font-semibold bg-[#553d8f] hover:bg-[#553d8f] text-white shadow-md relative overflow-hidden whitespace-nowrap h-full flex items-center justify-center"
                >
                  {isAdding ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Added!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      + Keranjang
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
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
                >
                  <Minus className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <span className="text-base font-semibold w-6 text-center">
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
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full border-[#a3e2f5]/40 hover:bg-[#a3e2f5]/10"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Detail Product Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg w-full h-[80vh] rounded-2xl p-0 sm:p-10 overflow-hidden [&>button]:hidden sm:[&>button]:block">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 sm:p-0 sm:hidden border-b">
            <DialogTitle className="text-lg font-bold text-[#2d3748] pr-8">
              {hamper.name}
            </DialogTitle>
            <button
              onClick={() => setShowDetailModal(false)}
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
            <DialogTitle className="text-lg font-bold text-[#2d3748]">
              {hamper.name}
            </DialogTitle>
          </DialogHeader>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
            <div className="p-5 w-full box-border">
              <div className="space-y-4 w-full max-w-full">
                
                {/* Product Image */}
                <div className="flex">
                  <div className="w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden border border-gray-200 mb-4">
                    <div
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${hamper.image})` }}
                    />
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="space-y-4 pb-4">
                  {/* Rating and Sales (placeholder values) */}
                  {/* <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-[#2d3748]">⭐</span>
                      <span className="text-sm font-semibold text-[#2d3748]">4.9</span>
                    </div>
                    <span className="text-sm text-[#4a5568]/60">•</span>
                    <span className="text-sm text-[#4a5568]/60">sold 89+</span>
                  </div> */}
                  
                  {/* Price */}
                  <div className="text-xl font-bold text-[#553d8f]">
                    {isJuiceHamper ? (
                      <div className="space-y-1">
                        <div className="text-sm text-[#4a5568]/70">Small: Rp {hamper.price_small?.toLocaleString('id-ID')}</div>
                        <div className="text-sm text-[#4a5568]/70">Large: Rp {hamper.price_large?.toLocaleString('id-ID')}</div>
                      </div>
                    ) : (
                      <span>Rp {hamper.price?.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#2d3748]">Product Description</h3>
                    <p className="text-sm text-[#4a5568]/75 leading-relaxed">
                      {hamper.description}
                    </p>
                  </div>
                  
                  {/* Size Options for Juice Hamper */}
                  {isJuiceHamper && (
                    <div className="space-y-2 w-full">
                      <h3 className="text-sm font-semibold text-[#2d3748]">Size Options</h3>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-[#f0f9ff] border border-[#e0f2fe]">
                          <div className="font-semibold text-[#0369a1]">Small (3 juices)</div>
                          <div className="text-sm text-[#4a5568]/70">Perfect for 1-2 people, includes greeting card</div>
                          <div className="font-semibold text-[#0369a1]">Rp {hamper.price_small?.toLocaleString('id-ID')}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#fef9c3] border border-[#fef08a]">
                          <div className="font-semibold text-[#854d0e]">Large (7 juices)</div>
                          <div className="text-sm text-[#4a5568]/70">Ideal for sharing, includes greeting card</div>
                          <div className="font-semibold text-[#854d0e]">Rp {hamper.price_large?.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Collection */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#2d3748]">Special Collection</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fff5f5] text-[#d26969] border border-[#ffd1d1] shadow-md backdrop-blur-sm">
                      {hamper.seasonal}
                    </span>
                  </div>

                  {/* What's Included */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#2d3748]">What's Included</h3>
                    <ul className="text-sm text-[#4a5568]/75 space-y-1">
                      {isJuiceHamper ? (
                        <>
                          <li>• {selectedSize === 'small' ? '3' : '7'} refreshing juices</li>
                          <li>• Insulated flap bag</li>
                          <li>• 2 ice packs</li>
                          <li>• Greeting card</li>
                        </>
                      ) : (
                        <>
                          <li>• Cookie jars per variant</li>
                          <li>• Greeting card</li>
                          <li>• Special packaging</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function HampersSection() {
  return (
    <section id="hampers-section" className="mb-6 md:mb-8 relative">
      <div className="bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#F5F8FC] rounded-2xl md:rounded-3xl p-3 md:p-4 lg:p-6 relative overflow-hidden border border-[#B3D9FF]/30">
        <SnowAnimation />
        <div className="relative z-10">
          <div className="text-left mb-6 md:mb-8 relative z-10">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#553d8f] mb-3 modak-regular drop-shadow-lg">
              Tiny Bitty Hampers
            </h3>
            <p className="text-base md:text-lg text-[#553d8f]/80 mb-4 leading-relaxed max-w-2xl drop-shadow-sm">
            Seasonal goodies wrapped with love—made for gifting, sharing, and enjoying cozy moments together.
            </p>
            <div className="h-1 w-16 bg-gradient-to-r from-[#553d8f] to-[#8B7BD8] rounded-full"></div>
          </div>

          {/* Responsive Layout - Mobile: 50:50, Desktop: 36:64 */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 md:gap-6 lg:gap-8">
            
            {/* Left Side - Image (36% on desktop, 50% on mobile) */}
            <div className="lg:col-span-4">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dodmwwp1w/image/upload/v1764868823/girl-her-mother-enjoying-winter-activities_1_cfnexr.png" 
                  alt="Tiny Bitty Hampers Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Side - Square Carousel (64% on desktop, 50% on mobile) */}
            <div className="lg:col-span-7">
              <Carousel
                opts={{
                  align: "start",
                  slidesToScroll: 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-2 lg:-ml-2">
                  {seasonalHampers.map((hamper, index) => (
                    <CarouselItem key={hamper.id} className="pl-2 md:pl-2 lg:pl-2 basis-[85%] md:basis-[75%] lg:basis-[36%]">
                      <div className="h-full flex justify-center">
                        <HamperCard hamper={hamper} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Carousel Navigation */}
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-11 z-10">
                  <CarouselPrevious className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#a3e2f5]/30 hover:bg-white shadow-md" />
                </div>
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-8 z-10">
                  <CarouselNext className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#a3e2f5]/30 hover:bg-white shadow-md" />
                </div>
              </Carousel>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
