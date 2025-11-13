import ProductCard from './ProductCard';
import { Product } from '@/types/product';

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  icon: string;
}

export default function ProductSection({ title, description, products, icon }: ProductSectionProps) {
  return (
    <section className="cookie-texture">
      <div className="text-center mb-5">
        <div className="mb-2">
          {icon.startsWith('/') ? (
            <img 
              src={icon} 
              alt={`${title} icon`} 
              className="w-60 h-60 object-contain mx-auto bottom-0"
            />
          ) : (
            <div className="text-5xl">{icon}</div>
          )}
        </div>
        <h2 className="text-5xl md:text-4xl font-bold text-[#553d8f] mb-1 knewave-regular">{title}</h2>
        <p className="text-gray-600 text-xl font-semibold max-w-2xl mx-auto patrick-hand-sc-regular">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}