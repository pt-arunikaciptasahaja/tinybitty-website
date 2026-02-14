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
    <section id="products" className="mb-6 md:mb-8 font-montserrat">
      <div className="border border-secondary/20 rounded-3xl md:rounded-3xl p-3 md:p-4 lg:p-6 bg-secondary/5">
        <div className="text-left mb-6 md:block">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F1ABA2] mb-1 font-montserrat-heading">
            Our Products
          </h3>
          <p className="text-muted-foreground text-sm md:text-base italic">
            Discover our secret recipe for instant smiles! ✨
          </p>
        </div>

        {/* Tabs navigation */}
        <Tabs defaultValue={getTabValue(categories[0]?.title || '')} className="w-full">
          <TabsList className="flex flex-wrap w-full gap-2 mb-6 bg-white/50 backdrop-blur-sm h-auto p-2 rounded-2xl border border-secondary/10">
            {categories.map((category) => (
              <TabsTrigger
                key={category.title}
                value={getTabValue(category.title)}
                className="
                    flex items-center gap-1.5 
                    text-[10px] sm:text-xs md:text-sm 
                    px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 
                    bg-transparent 
                    data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground 
                    text-secondary/70
                    hover:text-secondary hover:bg-secondary/10
                    transition-all duration-300 
                    flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 sm:flex-1 
                    rounded-xl border border-transparent data-[state=active]:border-secondary/20
                    font-medium tracking-wide
                  "
              >
                <span className="text-sm font-bold">{getDisplayTitle(category.title)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content for each category */}
          {categories.map((category) => (
            <TabsContent key={category.title} value={getTabValue(category.title)} className="mt-0">
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
                  <CarouselPrevious className="h-10 w-10 text-primary border-none bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-white shadow-md transition-all duration-300" />
                  <CarouselNext className="h-10 w-10 text-primary border-none bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-white shadow-md transition-all duration-300" />
                </div>
              </Carousel>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}