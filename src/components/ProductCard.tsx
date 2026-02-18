import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { fbPixelTrack } from '@/lib/fbpixel';
import { cldThumb } from '@/lib/cdn';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  // Default to appropriate size based on product type
  const getDefaultVariantIndex = (product: Product) => {
    // Check if this is a Tokyo Crumb product (bread products)
    const isTokyoCrumb = product.ingredients &&
      product.ingredients.includes('High-Protein Flour') &&
      (product.ingredients.includes('Butter') || product.ingredients.includes('Margarine'));

    if (isTokyoCrumb) {
      // For Tokyo Crumb products, default to "2-slice pack"
      const slicePackIndex = product.variants.findIndex(variant =>
        variant.size.toLowerCase().includes('slice pack') ||
        variant.size.toLowerCase().includes('2-slice')
      );
      return slicePackIndex !== -1 ? slicePackIndex : 0;
    }

    // For cookie products, default to Mini/XS variant
    if (product.ingredients && product.ingredients.includes('Flour') &&
      product.ingredients.includes('Eggs') &&
      product.ingredients.includes('Australian Butter')) {
      const miniIndex = product.variants.findIndex(variant =>
        variant.size.toLowerCase().includes('mini') ||
        variant.size.toLowerCase().includes('30gr')
      );
      return miniIndex !== -1 ? miniIndex : 0;
    }

    // Default to first variant for other products
    return 0;
  };

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(getDefaultVariantIndex(product));

  // Update selected variant index when product changes
  useEffect(() => {
    const defaultIndex = getDefaultVariantIndex(product);
    setSelectedVariantIndex(defaultIndex);
  }, [product]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const { addToCart, updateQuantity, removeFromCart, cart } = useCart();
  const { toast } = useToast();

  const selectedVariant = product.variants[selectedVariantIndex];
  const isMultiSize = product.variants.length > 1;
  const quantity = quantities[selectedVariantIndex] || 0;
  const hasItemInCart = quantity > 0;

  // Optimized product rating and sales calculations with useMemo
  const productRating = useMemo(() => {
    const name = product.name.toLowerCase();

    // Best sellers get higher ratings
    if (name.includes('choco almond')) return 4.9;
    if (name.includes('soursop') || name.includes('sirsak')) return 4.8;
    if (name.includes('macaroni')) return 4.8;
    if (name.includes('cheese-filled')) return 5.0;
    if (name.includes('vegan')) return 4.8;

    // Other products have slightly lower ratings
    return 4.9;
  }, [product.name]);

  const productSales = useMemo(() => {
    const name = product.name.toLowerCase();

    // Best sellers have higher sales
    if (name.includes('choco almond')) return '245+';
    if (name.includes('soursop') || name.includes('sirsak')) return '189+';
    if (name.includes('macaroni')) return '312+';

    // Other products have varied, distinct sales
    if (name.includes('chocolate')) return '156+';
    if (name.includes('vanilla')) return '134+';
    if (name.includes('strawberry')) return '98+';
    if (name.includes('cheese')) return '197+';
    if (name.includes('orange')) return '112+';
    if (name.includes('apple')) return '87+';
    if (name.includes('mango')) return '143+';
    if (name.includes('white')) return '148+';

    // Fallback for any other products
    return '75+';
  }, [product.name]);

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

  // Enhanced constants for better maintainability
  const ADD_TO_CART_DELAY = 600;
  const TOAST_SUCCESS_DURATION = 3000;

  // Validation helper functions for better error handling
  const validateProductData = useCallback(() => {
    const errors: string[] = [];

    if (!product?.id) errors.push('Product ID is missing');
    if (!product?.name) errors.push('Product name is missing');
    if (!selectedVariant?.size) errors.push('Variant size is missing');
    if (!selectedVariant?.price || selectedVariant.price <= 0) errors.push('Invalid variant price');
    if (!product?.image) errors.push('Product image is missing');

    return errors;
  }, [product, selectedVariant]);

  // Facebook Pixel tracking helper
  const trackAddToCartEvent = useCallback(async () => {
    try {
      const pixelData = {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        currency: 'IDR',
        value: selectedVariant.price,
        content_variant: selectedVariant.size,
      };

      // console.log('🔍 [FB PIXEL] AddToCart tracking:', {
      //   event: 'AddToCart',
      //   data: pixelData,
      //   productId: product.id,
      //   productName: product.name,
      //   variant: selectedVariant.size,
      //   price: selectedVariant.price,
      //   timestamp: new Date().toISOString()
      // });

      await fbPixelTrack('AddToCart', pixelData);

      // console.log('✅ [FB PIXEL] AddToCart event tracked successfully');
    } catch (error) {
      // Fail silently - don't block user experience if tracking fails
      console.warn('❌ [FB PIXEL] Failed to track AddToCart event:', error);
    }
  }, [product, selectedVariant]);

  // Optimized toast helper
  const showSuccessToast = useCallback(() => {
    toast({
      title: 'Yeay, berhasil! ✨',
      description: `${product.name} (${selectedVariant.size}) siap dinikmati.`,
      duration: TOAST_SUCCESS_DURATION,
    });
  }, [toast, product.name, selectedVariant.size]);

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
      // Validate product data before proceeding
      const validationErrors = validateProductData();
      if (validationErrors.length > 0) {
        showErrorToast(validationErrors.join(', '));
        setIsAdding(false);
        return;
      }

      // Add to cart with error handling
      addToCart({
        productId: product.id,
        productName: product.name,
        variant: selectedVariant,
        quantity: 1,
        image: product.image,
      });

      // Update local state
      setQuantities(prev => ({
        ...prev,
        [selectedVariantIndex]: 1
      }));

      // Show success feedback
      showSuccessToast();

      // Track the event (non-blocking)
      trackAddToCartEvent();

    } catch (error) {
      console.error('Add to cart failed:', error);
      showErrorToast('Terjadi kesalahan saat menambahkan produk ke keranjang');
    } finally {
      // Ensure loading state is reset
      setIsAdding(false);
    }
  }, [product, selectedVariant, selectedVariantIndex, addToCart, showSuccessToast, showErrorToast, trackAddToCartEvent, validateProductData]);

  // Main handler with performance optimizations
  const handleAddToCart = useCallback(async () => {
    // Prevent double-clicks and concurrent operations
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

  // Enhanced quantity handlers with better error handling and performance
  const handleIncreaseQuantity = useCallback(() => {
    const newQuantity = quantity + 1;

    try {
      setQuantities(prev => ({
        ...prev,
        [selectedVariantIndex]: newQuantity
      }));

      updateQuantity(product.id, selectedVariant.size, newQuantity);

      toast({
        title: 'Jumlah diganti 😋',
        description: `${newQuantity}x ${product.name} (${selectedVariant.size}) siap lanjut!`,
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
  }, [quantity, selectedVariantIndex, selectedVariant.size, product.id, product.name, updateQuantity, toast]);

  const handleDecreaseQuantity = useCallback(() => {
    const newQuantity = Math.max(0, quantity - 1);

    try {
      setQuantities(prev => ({
        ...prev,
        [selectedVariantIndex]: newQuantity
      }));

      updateQuantity(product.id, selectedVariant.size, newQuantity);

      if (newQuantity === 0) {
        toast({
          title: 'Dihapus dari keranjang',
          description: `${product.name} (${selectedVariant.size}) berhasil dihapus.`,
          duration: TOAST_SUCCESS_DURATION,
        });
      } else {
        toast({
          title: 'Jumlah diperbarui',
          description: `${newQuantity}x ${product.name} (${selectedVariant.size})`,
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
  }, [quantity, selectedVariantIndex, selectedVariant.size, product.id, product.name, updateQuantity, toast]);

  // Optimized size meta calculation with useCallback
  const getSizeMeta = useCallback((size: string) => {
    const s = size.toLowerCase();

    // 🔹 For Tokyo Crumb products (bread variants) - hide badge
    if (s.includes('sliced') || s.includes('slice') || s.includes('bread')) {
      return {
        code: '',                 // no badge code for bread
        label: size,              // show full size description
        badgeClass: '',           // empty badge class to hide
      };
    }

    // 🔹 For cookies with grams (Large 400gr, Medium 150gr, etc)
    if (/g[r]?/i.test(size)) {
      // Extract grams
      const gramsMatch = size.match(/(\d+\s?g[r]?)/i);
      const grams = gramsMatch ? gramsMatch[1].replace(/\s+/g, '') : '';

      // Determine size code (L, M, S, Mini)
      let code = '';
      let badgeClass = '';

      if (s.includes('mini')) {
        code = 'XS';
        badgeClass = 'bg-accent/20 text-accent-foreground border-accent/20'; // Pinkish
      } else if (s.startsWith('s') || s.includes('small')) {
        code = 'S';
        badgeClass = 'bg-muted/30 text-muted-foreground border-muted/20'; // Greenish
      } else if (s.startsWith('m') || s.includes('medium')) {
        code = 'M';
        badgeClass = 'bg-secondary/10 text-secondary border-secondary/20'; // Dark Greenish
      } else if (s.startsWith('l') || s.includes('large')) {
        code = 'L';
        badgeClass = 'bg-primary/10 text-primary border-primary/20'; // Primary Pink
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
        badgeClass: 'bg-muted/30 text-muted-foreground border-muted/20',
      };
    }

    // fallback for other sizes (like juice "250ml")
    return {
      code: size,                 // show full size for single-size products
      label: size,
      badgeClass: 'bg-gray-100 text-gray-700',
    };
  }, []);



  return (
    <Card
      className={`flex flex-col rounded-3xl bg-white p-2 md:p-4 duration-300 overflow-hidden ${className}`}
    // onClick={(e) => {
    //   // Prevent all clicks from bubbling up to carousel or other components
    //   e.stopPropagation();
    // }}
    // onMouseDown={(e) => {
    //   // Prevent mouse events that might trigger unwanted interactions
    //   e.stopPropagation();
    // }}
    >
      {/* TOP: image section */}
      <div className="relative mb-2 md:mb-4 group">
        <div className="w-full h-40 md:aspect-square rounded-2xl overflow-hidden bg-muted/10">
          <img
            src={cldThumb(product.image, { width: 600, quality: 'auto:eco' })}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        {product.isNew && (
          <Badge className="absolute top-2 right-2 bg-accent text-secondary text-[10px] px-2 py-0.5 shadow-md">
            NEW
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            setShowImageModal(true);
            e.stopPropagation();
          }}
          className="absolute bottom-2 right-2 text-secondary hover:text-secondary hover:bg-secondary/10 px-2 py-1 h-auto text-[11px] font-medium shadow-md bg-white/90 backdrop-blur-sm"
        >
          Detail produk
        </Button>
      </div>

      {/* BOTTOM: content section */}
      <div className="flex flex-col flex-1 space-y-1 md:space-y-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h3 className="text-xs md:text-base font-bold text-foreground truncate leading-tight flex-1">
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div className="text-sm md:text-sm font-semibold text-foreground">
          Rp {selectedVariant.price.toLocaleString('id-ID')}
        </div>

        {/* Star rating and sales info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-foreground">{productRating}</span>
          </div>
          <span className="text-xs text-foreground/60">•</span>
          <span className="text-xs text-foreground/60">terjual {productSales}</span>
        </div>

        {/* Size section - dropdown for multi-size, plain text for single-size */}
        <div className="w-full">
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
                  w-full h-8 md:h-10
                  rounded-full
                  border border-[#e5e7eb]
                  bg-[#f9fafb]
                  px-2 md:px-3
                  text-xs
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
                  p-1.5
                  will-change-transform
                  scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
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
                      <div className={`flex items-center ${meta.badgeClass ? 'gap-2.5' : 'gap-0'}`}>
                        {/* Size icon pill - only show if badgeClass exists */}
                        {meta.badgeClass && (
                          <div
                            className={`
                                flex items-center justify-center
                                w-5 h-5 md:w-7 md:h-7
                                rounded-full
                                text-[11px] font-semibold
                                ${meta.badgeClass}
                              `}
                          >
                            {meta.code}
                          </div>
                        )}

                        {/* Texts - always show */}
                        <div className="flex flex-col leading-tight">
                          <span className="text-[11px] font-semibold text-foreground">
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
            <div className="flex items-center justify-center w-full h-8 rounded-full bg-accent text-secondary text-[10px] font-semibold">
              {selectedVariant.size}
            </div>
          )}
        </div>

        {/* Bottom: Conditional UI - Beli button or Quantity controls */}
        <div
          className="mt-auto pt-1"
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
                disabled={isAdding}
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
            <div className="w-full h-10 md:h-12 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  handleDecreaseQuantity();
                  e.stopPropagation();
                }}
                disabled={isAdding}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full border-muted/40 hover:bg-muted/10 flex items-center justify-center"
              >
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <span className="text-base font-semibold w-8 text-center min-w-[2rem]">
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
                className="h-8 w-8 md:h-10 md:w-10 rounded-full border-muted/40 hover:bg-muted/10 flex items-center justify-center"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-lg w-full h-[80vh] rounded-2xl p-0 sm:p-10 overflow-hidden [&>button]:hidden sm:[&>button]:block">
          {/* Mobile Header with bigger close button */}
          <div className="flex items-center justify-between p-4 sm:p-0 sm:hidden border-b">
            <DialogTitle className="text-lg font-bold text-foreground pr-8">
              {product.name}
            </DialogTitle>
            <button
              onClick={() => setShowImageModal(false)}
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
              {product.name}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
            <div className="p-5 w-full box-border">
              <div className="space-y-1 md:space-y-3 w-full max-w-full">

                {/* Product Image - Responsive and Visible */}
                <div className="flex">
                  <div className="w-[370px] h-[370px] sm:w-[325px] sm:h-[325px] md:w-[325px] md:h-[325px] lg:w-[389px] lg:h-[389px] rounded-2xl overflow-hidden border border-gray-200 mb-3 md:mb-3">
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
                      <span className="text-sm font-semibold text-foreground">{productRating}</span>
                    </div>
                    <span className="text-sm text-foreground/60">•</span>
                    <span className="text-sm text-foreground/60">terjual {productSales}</span>
                  </div>

                  {/* Price */}
                  <div className="text-lg font-bold text-foreground">
                    Rp {selectedVariant.price.toLocaleString('id-ID')}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Deskripsi Produk</h3>
                    <p className="text-sm text-foreground/75 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Size Info */}
                  <div className="space-y-2 w-full">
                    <h3 className="text-sm font-semibold text-foreground">Pilihan Size</h3>
                    <div className="flex flex-wrap gap-2 w-full max-w-full">
                      {product.variants.map((variant, index) => {
                        const meta = getSizeMeta(variant.size);
                        return (
                          <Badge
                            key={index}
                            variant={index === selectedVariantIndex ? "default" : "secondary"}
                            className={`text-xs py-1 px-3 shrink-0 ${index === selectedVariantIndex
                              ? 'bg-secondary text-white hover:bg-secondary'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            {meta.badgeClass ?
                              (meta.label && meta.label !== meta.code ? `${meta.code} - ${meta.label}` : meta.code)
                              : meta.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ingredients */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="space-y-2 w-full">
                      <h3 className="text-sm font-semibold text-foreground">Ingredients:</h3>
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
                      <h3 className="text-sm font-semibold text-foreground">Topping</h3>
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
                      <h3 className="text-sm font-semibold text-foreground">Cup Size</h3>
                      <div className="text-sm text-foreground/75 leading-relaxed">
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

