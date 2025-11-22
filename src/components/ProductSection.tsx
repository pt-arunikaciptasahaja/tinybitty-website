import ProductCard from './ProductCard';
import { Product } from '@/types/product';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  icon: string;
}

export default function ProductSection({
  title,
  description,
  products,
  icon,
}: ProductSectionProps) {
  // Define pastel background colors for each category
  const getBackgroundClass = (title: string) => {
    switch (title.toLowerCase()) {
      case 'cookies':
        return 'bg-[#fff2cc]';
      case 'tiny juice':
        return 'bg-purple-50';
      case 'macaroni schotel':
        return 'bg-blue-50';
      default:
        return 'bg-orange-50';
    }
  };

  // Map original titles to custom display titles
  const getDisplayTitle = (title: string) => {
    switch (title.toLowerCase()) {
      case 'cookies':
        return 'Sweet Bites';
      case 'tiny juice':
        return 'Fruity Splash';
      case 'macaroni schotel':
        return 'Hearty Bites';
      default:
        return title;
    }
  };

  return (
    <section className="mb-6 md:mb-8">
      <div className={`cookie-texture rounded-2xl md:rounded-3xl p-3 md:p-4 lg:p-6 ${getBackgroundClass(title)}`}>
        <div className="text-left mb-3 hidden md:block">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#553d8f] mb-1 modak-regular">
            {getDisplayTitle(title)}
          </h3>
        </div>

        {/* Carousel layout with 4 cards per slide */}
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
          }}
          className="w-full overflow-visible"
        >
          <CarouselContent className="-ml-4 md:-ml-2">
            {products.map((product, index) => (
              <CarouselItem key={product.id} className="pl-4 md:pl-2 basis-[80%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%] xl:basis-[18%]">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Built-in carousel navigation */}
          <div className="hidden md:block">
            <CarouselPrevious className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#a3e2f5]/30 hover:bg-white shadow-sm" />
            <CarouselNext className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#a3e2f5]/30 hover:bg-white shadow-sm" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}