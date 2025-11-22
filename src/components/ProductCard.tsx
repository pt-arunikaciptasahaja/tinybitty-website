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
      label: '',                  // empty label to avoid duplication
      badgeClass: 'bg-gray-100 text-gray-700',
    };
  };
  


  return (
    <Card
      className={`flex flex-col h-[480px] md:h-[520px] border border-[#e5e7eb] rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group w-full md:w-80 lg:w-80 ${className}`}
    >
      {/* Image Section */}
      <div 
        className="relative w-full aspect-square md:aspect-square overflow-hidden rounded-t-2xl cursor-pointer"
        onClick={() => setShowImageModal(true)}
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        {product.isNew && (
          <Badge className="absolute top-3 left-3 bg-[#C5B8FF] border-[#553d8f]/10 text-white text-xs px-2 py-1 font-semibold shadow-md">
            NEW
          </Badge>
        )}
        
        {/* Click to view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Rating and Sales */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">{productRating}</span>
          </div>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">terjual {productSales}</span>
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-gray-900">
          Rp {selectedVariant.price.toLocaleString('id-ID')}
        </div>



        {/* Size Selection */}
        {isMultiSize && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Size:</label>
            <Select
              value={selectedVariantIndex.toString()}
              onValueChange={(value) => setSelectedVariantIndex(parseInt(value))}
            >
              <SelectTrigger className="w-full h-10 border border-gray-300 rounded-xl bg-white">
                <SelectValue placeholder="Pilih ukuran" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-gray-200">
                {product.variants.map((variant, index) => {
                  const meta = getSizeMeta(variant.size);
                  return (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`
                            w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center
                            ${meta.badgeClass}
                          `}
                        >
                          {meta.code}
                        </div>
                        <span className="text-sm">{meta.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Single size display */}
        {!isMultiSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Size:</span>
            <Badge className="text-xs bg-[#C5B8FF]">
              {selectedVariant.size}
            </Badge>
          </div>
        )}

        {/* Add to Cart / Quantity Controls */}
        <div className="mt-auto pt-2">
          {!hasItemInCart ? (
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full h-12 bg-[#553d8f] hover:bg-[#553d8f]/90 text-white font-semibold rounded-2xl transition-colors"
            >
              {isAdding ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Added to Cart
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  keranjang
                </span>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecreaseQuantity}
                disabled={isAdding}
                className="h-10 w-10 rounded-lg border border-gray-300 hover:bg-gray-50"
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
                className="h-10 w-10 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-xl w-full max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 mb-3">
              {product.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Full Size Image */}
            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${product.image})` }}
              />
            </div>
            
            {/* Product Details */}
            <div className="space-y-3">
              {/* Rating and Sales */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900">{productRating}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-sm text-gray-500">terjual {productSales}</span>
              </div>
              
              {/* Price */}
              <div className="text-2xl font-bold text-gray-900">
                Rp {selectedVariant.price.toLocaleString('id-ID')}
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900">Deskripsi Produk</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
              
              {/* Size Info */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900">Pilihan Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => {
                    const meta = getSizeMeta(variant.size);
                    return (
                      <Badge 
                        key={index} 
                        variant={index === selectedVariantIndex ? "default" : "secondary"}
                        className={`text-xs py-1 px-2 ${
                          index !== selectedVariantIndex 
                            ? 'bg-purple-200 text-purple-800 hover:bg-purple-200' 
                            : ''
                        }`}
                      >
                        {meta.label ? `${meta.code} - ${meta.label}` : meta.code}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}