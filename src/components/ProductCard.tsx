import { useState } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    
    // Reset animation after 600ms
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  return (
    <Card className={`card overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-[#a3e2f5]/20 hover:border-[#553d8f]/40 bg-white rounded-3xl flex flex-col group ${className}`}>
      {/* Card Info Hover Overlay */}
      <div className="card__info-hover absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-[#553d8f]/80 to-[#553d8f]/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <div className="flex justify-start items-start">
          <div className="text-white text-sm font-medium">
            {product.name}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Main Image */}
        <div
          className="card__img w-full h-56 bg-cover bg-center bg-no-repeat rounded-t-3xl"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        
        {/* Hover Image Overlay */}
        <div
          className="card__img--hover absolute inset-0 bg-cover bg-center bg-no-repeat rounded-t-3xl transition-all duration-300 opacity-0 group-hover:opacity-20 group-hover:h-full"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        
        {product.isNew && (
          <Badge className="absolute top-3 right-3 bg-[#ffa101] text-white shadow-lg z-20">
            NEW
          </Badge>
        )}
      </div>
      
      <CardHeader className="relative z-0">
        <CardTitle className="text-xl font-bold text-[#11110a]">{product.name}</CardTitle>
        <CardDescription className="text-[#11110a]/70">{product.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 relative z-0">
        <div>
          <label className="text-sm font-medium text-[#11110a]/80 mb-2 block">Select Size</label>
          <Select
            value={selectedVariantIndex.toString()}
            onValueChange={(value) => setSelectedVariantIndex(parseInt(value))}
          >
            <SelectTrigger className="w-full rounded-xl border-[#a3e2f5]/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {product.variants.map((variant, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {variant.size} - Rp {variant.price.toLocaleString('id-ID')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#11110a]/80 mb-2 block">Quantity</label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="rounded-full border-[#a3e2f5]/30 hover:bg-[#a3e2f5]/10"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="rounded-full border-[#a3e2f5]/30 hover:bg-[#a3e2f5]/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative z-0">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full bg-[#edadc3] hover:bg-[#edadc3]/90 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl py-6 relative overflow-hidden ${
            isAdding
              ? 'scale-95 animate-pulse'
              : 'hover:scale-105 active:scale-95'
          }`}
        >
          <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${
            isAdding ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}>
            Add to Cart
          </span>
          <span className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ${
            isAdding ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}>
            <Check className="w-5 h-5" />
            Added!
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}