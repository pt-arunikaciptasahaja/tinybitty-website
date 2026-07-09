import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product';
import type { ProductRow } from '@/types/supabase-models';
import { supabase } from '@/lib/supabase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';

// Map DB row → Product interface used by ProductCard
function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    variants: row.variants,
    isNew: row.is_new,
    ingredients: row.ingredients,
    toppings: row.toppings,
  };
}

type Category = 'cookies' | 'juice';

interface CategoryConfig {
  key: Category;
  title: string;
  displayTitle: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'cookies',
    title: 'Cookies',
    displayTitle: 'Sweet Bites',
    description:
      'Super crunchy, melt-in-your-mouth delicious cookies baked fresh daily. Perfect for a quick snack break or a sweet gift!',
  },
  {
    key: 'juice',
    title: 'Tiny Juice',
    displayTitle: 'Fruity Splash',
    description:
      '100% natural, preservative-free juice squeezed straight from fresh fruits. The ultimate refreshing pick-me-up!',
  },
];

function getTabValue(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-');
}

export default function ProductSection() {
  const [productsByCategory, setProductsByCategory] = useState<Record<Category, Product[]>>({
    cookies: [],
    juice: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (err) {
      setError('Products could not be loaded. Please refresh the page.');
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as ProductRow[];
    const grouped: Record<Category, Product[]> = { cookies: [], juice: [] };

    for (const row of rows) {
      // Temporarily hide Desert Crown (Ramadan special)
      if (row.name.toLowerCase().includes('desert crown')) {
        continue;
      }
      if (row.category === 'cookies' || row.category === 'juice') {
        // Show isNew items first within each category
        grouped[row.category].push(toProduct(row));
      }
    }

    // Sort: isNew first, then by name
    for (const cat of Object.keys(grouped) as Category[]) {
      grouped[cat].sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    setProductsByCategory(grouped);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section id="products" className="mb-8 md:mb-10 font-montserrat">
        <div className="border rounded-3xl p-3 md:p-4 lg:p-6 bg-[#EAEEE3]">
          <div className="text-left mb-6">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F1ABA2] mb-1 font-montserrat-heading">
              Our Products
            </h3>
            <p className="text-muted-foreground text-sm md:text-base italic">
              Discover our secret recipe for instant smiles! ✨
            </p>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-48 rounded-3xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products" className="mb-8 md:mb-10 font-montserrat">
        <div className="border rounded-3xl p-6 bg-[#EAEEE3] text-center space-y-3">
          <p className="text-muted-foreground text-sm">{error}</p>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Try again
          </button>
        </div>
      </section>
    );
  }

  const hasAnyProducts = CATEGORIES.some((c) => productsByCategory[c.key].length > 0);

  if (!hasAnyProducts) {
    return (
      <section id="products" className="mb-8 md:mb-10 font-montserrat">
        <div className="border rounded-3xl p-8 bg-[#E9EDE2] text-center">
          <p className="text-muted-foreground text-sm">No products available yet.</p>
        </div>
      </section>
    );
  }

  // Only show categories that have products
  const activeCategories = CATEGORIES.filter((c) => productsByCategory[c.key].length > 0);

  return (
    <section id="products" className="mb-8 md:mb-10 font-montserrat">
      <div className="border rounded-3xl md:rounded-3xl p-3 md:p-4 lg:p-6 bg-[#E9EDE2]">
        <div className="text-left mb-6 md:block">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F1ABA2] mb-1 font-montserrat-heading">
            Our Products
          </h3>
          <p className="text-muted-foreground text-sm md:text-base italic">
            Discover our secret recipe for instant smiles! ✨
          </p>
        </div>

        <Tabs defaultValue={getTabValue(activeCategories[0]?.title ?? '')} className="w-full">
          <TabsList className="flex flex-wrap w-full gap-2 mb-6 bg-white/50 backdrop-blur-sm h-auto p-2 rounded-2xl border border-secondary/10">
            {activeCategories.map((category) => (
              <TabsTrigger
                key={category.key}
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
                <span className="text-sm font-bold">{category.displayTitle}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {activeCategories.map((category) => (
            <TabsContent key={category.key} value={getTabValue(category.title)} className="mt-0">
              <Carousel
                opts={{ align: 'start', slidesToScroll: 1 }}
                className="w-full overflow-visible"
              >
                <CarouselContent className="-ml-4 md:-ml-3">
                  {productsByCategory[category.key].map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="pl-4 md:pl-3 basis-[57%] sm:basis-[57%] md:basis-[22%] lg:basis-[22%] xl:basis-[18%]"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="h-10 w-10 text-primary border-none bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-white shadow-md transition-all duration-300 z-50 -left-4" />
                  <CarouselNext className="h-10 w-10 text-primary border-none bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-white shadow-md transition-all duration-300 z-50 -right-4" />
                </div>
              </Carousel>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
