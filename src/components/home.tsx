import Header from './Header';
import Hero from './Hero';
import RunningText from './RunningText';
import ProductSection from './ProductSection';
import OrderForm from './OrderForm';
import Footer from './Footer';
import productsData from '@/data/products.json';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 xl:px-16" style={{ backgroundColor: '#f5f7f7' }}>
      <Header />
      <Hero />
      
      <RunningText />
      
      <main id="products">
        <ProductSection
          title="Cookies"
          description="Crispy and delicious dry cookies, perfect for snacks or gifts"
          products={productsData.cookies}
          icon="/cookies-icon.png"
        />
        
        <ProductSection
          title="Tiny Juice"
          description="Fresh juice without preservatives, made from quality selected fruits"
          products={productsData.juice}
          icon="/juice-icon.png"
        />
        
        <ProductSection
          title="Macaroni Schotel"
          description="Baked macaroni with creamy and savory cheese sauce"
          products={productsData.macaroni}
          icon="/mac-icon.png"
        />
      </main>

      <OrderForm />

      <Footer />
      <Toaster />
    </div>
  );
}