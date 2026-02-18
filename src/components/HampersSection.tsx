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
import CookieFallingAnimation from './CookieFallingAnimation';
import { cldThumb } from '@/lib/cdn';

// Seasonal hamper data with Eid theme
const seasonalHampers = [
  {
    id: 'eid-1',
    name: 'Eid Hampers A',
    description:
      'A simple, wholesome treat made with Medjool dates, oats, and sliced almonds. Naturally sweet, lightly crunchy, and perfectly comforting in every bite. Beautifully packed and ideal for gifting or enjoying anytime.',
    price: 90000,
    image: cldThumb(
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068682/ChatGPT_Image_Feb_14_2026_06_30_55_PM_ouyqsr.png',
      { width: 600, quality: 'auto:eco' },
    ),
    images: [
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068682/ChatGPT_Image_Feb_14_2026_06_30_55_PM_ouyqsr.png',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/b_rgb:FFFFFF/v1771161737/ChatGPT_Image_Feb_8_2026_07_47_22_PM_s3tqf3.png',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/f_png/v1770741397/IMG_9066_b1xkzv.jpg',
        { width: 900, quality: 'auto' },
      ),
    ],
    rating: 5.0,
    sales: '89+',
    seasonal: 'Eid Collection',
    whatsIncluded: [
      '1 cookie jar',
      '2 Greeting cards',
      'Gift box'
    ],
    // isNew: true
  },
  {
    id: 'eid-2',
    name: 'Eid Hampers B',
    description:
      'A charming cookie hamper filled with our signature wholesome cookies, beautifully presented for gifting. Comes with two greeting cards, a decorative ribbon, and an elegant gift box—perfect for celebrations, special moments, or a thoughtful surprise.',
    price: 195000,
    image: cldThumb(
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1770745549/Gemini_Generated_Image_ulp3txulp3txulp3_nxct9q.png',
      { width: 600, quality: 'auto:eco' },
    ),
    images: [
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771162612/ChatGPT_Image_Feb_8_2026_08_08_11_PM_vbvevz.png',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/f_png/v1770745549/Gemini_Generated_Image_ulp3txulp3txulp3_nxct9q.png',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/b_rgb:FFFFFF/v1771163442/ChatGPT_Image_Feb_15_2026_08_50_18_PM_pnawg9.png',
        { width: 900, quality: 'auto' },
      ),
    ],
    rating: 4.9,
    sales: '156+',
    seasonal: 'Eid Collection',
    whatsIncluded: [
      '2 cookie jars',
      '2 greeting cards',
      'Decorative ribbon',
      'Gift box'
    ],
    // isNew: true
  },
  {
    id: 'eid-3',
    name: 'Eid Hampers C',
    description:
      'A thoughtfully curated cookie hamper, beautifully presented and ready to gift. This set includes our signature cookies, two greeting cards, a decorative ribbon, an elegant gift box, and a premium paper bag for a polished finishing touch.',
    price: 375000,
    image: cldThumb(
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1770746119/Gemini_Generated_Image_wl95zjwl95zjwl95_jgqfln.png',
      { width: 600, quality: 'auto:eco' },
    ),
    images: [
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/b_rgb:FFFFFF/v1771163753/ChatGPT_Image_Feb_8_2026_06_51_51_PM_x2dqrt.png',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/a_-90/f_png/v1770741362/IMG_9053_x2asbo.jpg',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FFFFFF/f_png/v1770741410/IMG_9078_frorxs.jpg',
        { width: 900, quality: 'auto' },
      ),
    ],
    rating: 4.8,
    sales: '67+',
    seasonal: 'Eid Collection',
    whatsIncluded: [
      '3 cookie jars',
      '2 greeting cards',
      'Decorative ribbon',
      'Gift box',
      'Premium paper bag'
    ],
    // isNew: true
  },
  {
    id: 'eid-d',
    name: 'Eid Hampers D',
    description:
      'Customizable Eid hampers that you can fill with either three or five tiny juices, or two 100-gram pouches of cookies. Perfect for gifting, sharing, or treating yourself during Eid celebrations.',
    price_large: 170000,
    price_small: 90000,
    image: cldThumb(
      'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771417485/Gemini_Generated_Image_wy61y7wy61y7wy61_nbjspy.png',
      { width: 600, quality: 'auto:eco' },
    ),
    images: [
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771417485/Gemini_Generated_Image_wy61y7wy61y7wy61_nbjspy.png',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771418738/yupp-generated-image-855171_gjo9aa.png',
        { width: 900, quality: 'auto' },
      ),
      cldThumb(
        'https://res.cloudinary.com/dodmwwp1w/image/upload/v1771164684/sg-11134201-22100-3gvh6ej7a5iv2a_e3xqqx.webp',
        { width: 900, quality: 'auto' },
      ),
    ],
    rating: 4.9,
    sales: '78+',
    seasonal: 'Eid Collection',
    whatsIncluded: [
      'Choice of: 3 or 5 tiny juices OR 2x 100g cookie pouches',
      'Packaging bag',
      '2 ice packs',
      '2 Greeting cards'
    ],
    // isNew: true
  }
];

function HamperCard({ hamper }: { hamper: typeof seasonalHampers[0] }) {
  const [selectedSize, setSelectedSize] = useState<
    'pouch' | 'three-juices' | 'five-juices'
  >('pouch');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart, updateQuantity, cart } = useCart();
  const { toast } = useToast();

  const isJuiceHamper = hamper.id === 'eid-d';
  const currentPrice = isJuiceHamper
    ? selectedSize === 'pouch'
      ? 65000
      : selectedSize === 'three-juices'
        ? 85000
        : 125000
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
        className={`flex flex-col border border-muted/30 rounded-3xl bg-white p-3 md:p-4transition-shadow duration-300 overflow-hidden mx-auto min-h-[494.5px] max-h-[600px]`}
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
          <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden">
            <img
              src={hamper.image}
              alt={hamper.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-md backdrop-blur-sm">
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
              className="text-secondary hover:text-secondary hover:bg-secondary/10 px-2 py-1 h-auto text-[11px] font-medium shrink-0 bg-white/90 backdrop-blur-sm border border-secondary/20 shadow-md"
            >
              Detail produk
            </Button>
          </div>
        </div>

        {/* BOTTOM: content section - Full featured */}
        <div className="flex flex-col flex-1 space-y-2 md:space-y-3">
          {/* Title */}
          <h3 className="text-sm md:text-base font-bold text-foreground truncate leading-tight">
            {hamper.name}
          </h3>

          {/* Price */}
          <div className="text-sm md:text-base font-semibold text-foreground">
            Rp {currentPrice?.toLocaleString('id-ID')}
          </div>

          {/* What's included preview - flex-1 to fill space */}
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground/80">What's Included:</span>
            </div>
            <ul className="text-xs text-foreground/70 space-y-0.5">
              {hamper.whatsIncluded?.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>

          {/* Size section - Consistent height for all hampers */}
          <div className="w-full h-10 md:h-10 flex items-center mb-1">
            {isJuiceHamper ? (
              /* Dropdown for multi-size products (juice hampers) */
              <Select
                value={selectedSize}
                onValueChange={(value) => {
                  setSelectedSize(value as 'pouch' | 'three-juices' | 'five-juices');
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
                    data-[state=open]:border-muted
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
                    border border-muted
                    bg-white
                    shadow-lg
                    p-2
                    will-change-transform
                    scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
                  "
                >
                  <SelectItem
                    value="pouch"
                    className="
                      text-sm
                      py-2 px-3
                      rounded-xl
                      bg-white
                      data-[state=checked]:bg-muted
                      data-[state=checked]:text-secondary
                      data-[highlighted]:bg-muted/10
                      data-[highlighted]:text-secondary
                      cursor-pointer
                      focus:bg-muted/10
                      focus:text-secondary
                      hover:bg-muted/10
                      hover:text-secondary
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1]">
                        P
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-foreground">
                          2x 30gr pouches
                        </span>
                        <span className="text-xs text-foreground/70">
                          Rp 65.000
                        </span>
                      </div>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value="three-juices"
                    className="
                      text-sm
                      py-2 px-3
                      rounded-xl
                      bg-white
                      data-[state=checked]:bg-muted
                      data-[state=checked]:text-secondary
                      data-[highlighted]:bg-muted/10
                      data-[highlighted]:text-secondary
                      cursor-pointer
                      focus:bg-muted/10
                      focus:text-secondary
                      hover:bg-muted/10
                      hover:text-secondary
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold bg-[#fef9c3] text-[#854d0e]">
                        J3
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-foreground">
                          3 juices
                        </span>
                        <span className="text-xs text-foreground/70">
                          Rp 85.000
                        </span>
                      </div>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value="five-juices"
                    className="
                      text-sm
                      py-2 px-3
                      rounded-xl
                      bg-white
                      data-[state=checked]:bg-muted
                      data-[state=checked]:text-secondary
                      data-[highlighted]:bg-muted/10
                      data-[highlighted]:text-secondary
                      cursor-pointer
                      focus:bg-muted/10
                      focus:text-secondary
                      hover:bg-muted/10
                      hover:text-secondary
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#166534]">
                        J5
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-foreground">
                          5 juices
                        </span>
                        <span className="text-xs text-foreground/70">
                          Rp 125.000
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              /* Plain text for single-size products (cookie hampers) */
              <div className="flex items-center justify-center w-full h-10 md:h-12 rounded-full text-secondary text-sm font-semibold px-3 md:px-8 bg-[#B6D88C]">
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
                <button
                  onClick={() => handleAddToCart()}
                  disabled={isAdding || !currentPrice}
                  className="relative w-full h-full flex items-center justify-center rounded-full bg-foreground text-white shadow-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-primary/20"
                >
                  <div className="relative z-10 flex items-center justify-center gap-1.5 px-3 md:px-8">
                    {isAdding ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-wide">Added!</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-wide">+ Keranjang</span>
                      </>
                    )}
                  </div>
                  <span className="absolute inset-0 z-0 bg-primary scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 origin-center" />
                </button>
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
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full border-muted/40 hover:bg-muted/10"
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
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full border-muted/40 hover:bg-muted/10"
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
            <DialogTitle className="text-lg font-bold text-foreground pr-8">
              {hamper.name}
            </DialogTitle>
            <button
              onClick={() => setShowDetailModal(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Desktop Header */}
          <DialogHeader className="hidden sm:flex flex-shrink-0 px-0">
            <DialogTitle className="text-lg font-bold text-foreground">
              {hamper.name}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
            <div className="p-5 w-full box-border">
              <div className="space-y-4 w-full max-w-full">

                {/* Product Image Carousel */}
                <div className="flex w-full mb-4">
                  <Carousel
                    opts={{
                      align: "center",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {(hamper.images || [hamper.image]).map((img, idx) => (
                        <CarouselItem key={idx}>
                          <div className="w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden border border-gray-200">
                            <img
                              src={img}
                              alt={hamper.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/90 backdrop-blur-sm border-none shadow-lg text-secondary hover:bg-secondary hover:text-white transition-all duration-300" />
                    <CarouselNext className="right-2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/90 backdrop-blur-sm border-none shadow-lg text-secondary hover:bg-secondary hover:text-white transition-all duration-300" />
                  </Carousel>
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
                  <div className="text-xl font-bold text-secondary">
                    {isJuiceHamper ? (
                      <div className="space-y-1 text-sm text-secondary/70">
                        <div>2x 30gr pouches: Rp 65.000</div>
                        <div>3 juices: Rp 85.000</div>
                        <div>5 juices: Rp 125.000</div>
                      </div>
                    ) : (
                      <span>Rp {hamper.price?.toLocaleString('id-ID')}</span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Product Description</h3>
                    <p className="text-sm text-foreground/75 leading-relaxed">
                      {hamper.description}
                    </p>
                  </div>

                  {/* Size Options for Juice Hamper */}
                  {isJuiceHamper && (
                    <div className="space-y-2 w-full">
                      <h3 className="text-sm font-semibold text-foreground">Size Options</h3>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-[#f0f9ff] border border-[#e0f2fe]">
                          <div className="font-semibold text-[#0369a1]">2x 30gr pouches</div>
                          <div className="text-sm text-secondary/70">Perfect as a light treat or add-on gift</div>
                          <div className="font-semibold text-[#0369a1]">Rp 65.000</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#fef9c3] border border-[#fef08a]">
                          <div className="font-semibold text-[#854d0e]">3 juices</div>
                          <div className="text-sm text-secondary/70">Great for sharing or a more generous gift</div>
                          <div className="font-semibold text-[#854d0e]">Rp 85.000</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#dcfce7] border border-[#bbf7d0]">
                          <div className="font-semibold text-[#166534]">5 juices</div>
                          <div className="text-sm text-secondary/70">Best for sharing with loved ones</div>
                          <div className="font-semibold text-[#166534]">Rp 125.000</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Collection */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Special Collection</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-md backdrop-blur-sm">
                      {hamper.seasonal}
                    </span>
                  </div>

                  {/* What's Included */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">What's Included</h3>
                    <ul className="text-sm text-foreground/75 space-y-1">
                      {hamper.whatsIncluded?.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
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
    <section id="hampers-section" className="mb-6 md:mb-8 relative font-montserrat">
      <div className="border border-secondary/20 rounded-2xl md:rounded-3xl p-3 md:p-4 lg:p-6 relative overflow-hidden" style={{ backgroundColor: '#FBF0D0' }}>
        {/* <div className="hidden md:block">
          <CookieFallingAnimation />
        </div> */}
        <div className="relative z-10">
          <div className="text-left mb-6 md:mb-8 relative z-10">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F1ABA2] mb-1 font-montserrat-heading">
              Tiny Bitty Hampers
            </h3>
            <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed max-w-2xl italic">
              Share the sweetness of Eid with our curated hampers! 🌙✨
            </p>
            <div className="h-1 w-16 bg-gradient-to-r from-secondary to-muted rounded-full"></div>
          </div>

          {/* Responsive Layout - Mobile: 50:50, Desktop: 36:64 */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 md:gap-6 lg:gap-8">

            {/* Left Side - Image (36% on desktop, 50% on mobile) */}
            <div className="hidden lg:col-span-4 lg:block">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src={cldThumb(
                    "https://res.cloudinary.com/dodmwwp1w/image/upload/e_background_removal/b_rgb:FAF0D1/f_png/v1771164854/Gemini_Generated_Image_dk03yydk03yydk03_xr2ajp.png",
                    { width: 700, quality: "auto:eco" },
                  )}
                  alt="Tiny Bitty Hampers Collection"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
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
                className="w-full overflow-visible"
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
                <div className="hidden md:block">
                  <CarouselPrevious className="!left-[2%] h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm border-none shadow-md text-primary hover:bg-primary hover:text-white transition-all duration-300 z-50 transform hover:scale-110" />
                  <CarouselNext className="!right-[2%] h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm border-none shadow-xl text-primary hover:bg-primary hover:text-white transition-all duration-300 z-50 transform hover:scale-110" />
                </div>
              </Carousel>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
