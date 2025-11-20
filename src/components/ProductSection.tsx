import ProductCard from './ProductCard';
import { Product } from '@/types/product';

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
        return 'bg-pink-50';
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
    <section className="mb-12 md:mb-16">
      <div className={`cookie-texture rounded-3xl md:rounded-[2rem] p-6 md:p-8 lg:p-10 ${getBackgroundClass(title)}`}>
        <div className="text-center mb-6">
          <h2 className="text-6xl md:text-6xl font-bold text-[#553d8f] mb-1 modak-regular">
            {getDisplayTitle(title)}
          </h2>
          {/* <p className="text-gray-600 text-base md:text-lg font-semibold max-w-2xl mx-auto patrick-hand-sc-regular">
            {description}
          </p> */}
        </div>

        {/* Compact grid layout for desktop */}
        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}