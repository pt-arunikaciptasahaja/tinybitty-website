import ProductCard from './ProductCard';
import { Product } from '@/types/product';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Category {
  title: string;
  description: string;
  products: Product[];
  icon: string;
  id?: string;
}

interface ProductSectionProps {
  categories: Category[];
}

export default function ProductSection({
  categories,
}: ProductSectionProps) {
  // Define pastel background colors for each category
  const getBackgroundClass = (title: string) => {
    switch (title.toLowerCase()) {
      case 'cookies':
        return 'bg-[#C5B8FF]/20';
      case 'tiny juice':
        return 'bg-[#C5B8FF]/20';
      case 'macaroni schotel':
        return 'bg-[#C5B8FF]/20';
      case 'tokyo crumb':
        return 'bg-[#C5B8FF]/20';
      default:
        return 'bbg-[#C5B8FF]/20';
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
      case 'tokyo crumb':
        return 'Tokyo Crumb';
      default:
        return title;
    }
  };

  // Create tab values that are URL-friendly
  const getTabValue = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <section id="products" className="mb-6 md:mb-8">
      <div className={`border border-[#C5B8FF]/20 rounded-3xl md:rounded-3xl p-3 md:p-4 lg:p-6 ${getBackgroundClass(categories[0]?.title || '')}`}>
        {/* <div className='bg-[#f5f7f7] px-8 py-9 rounded-xl'> */}
          <div className="text-left mb-6 md:block">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#553d8f] mb-1 modak-regular">
              Our Products
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              Discover our delicious range of freshly made treats
            </p>
          </div>

          {/* Tabs navigation */}
          <Tabs defaultValue={getTabValue(categories[0]?.title || '')} className="w-full">
            <TabsList className="flex flex-wrap w-full gap-2 mb-6 bg-[#C5B8FF]/20 backdrop-blur-sm h-auto p-2">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.title}
                  value={getTabValue(category.title)}
                  className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white data-[state=active]:bg-[#553d8f] data-[state=active]:text-white transition-all duration-200 flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 sm:flex-1 border border-[#C5B8FF]/20"
                >
                  <span className="text-sm">{getDisplayTitle(category.title)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab content for each category */}
            {categories.map((category) => (
              <TabsContent key={category.title} value={getTabValue(category.title)}>
                {/* <div className="mb-4">
                  <p className="text-gray-600 text-sm md:text-base">
                    {category.description}
                  </p>
                </div> */}
                
                {/* Carousel layout with 4 cards per slide */}
                <Carousel
                  opts={{
                    align: "start",
                    slidesToScroll: 1,
                  }}
                  className="w-full overflow-visible"
                >
                  <CarouselContent className="-ml-4 md:-ml-3">
                    {category.products.map((product, index) => (
                      <CarouselItem key={product.id} className="pl-4 md:pl-3 basis-[57%] sm:basis-[57%] md:basis-[22%] lg:basis-[22%] xl:basis-[18%]">
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      {/* </div> */}
    </section>
  );
}