import Header from './Header';
import Hero from './Hero';
import Benefits from './Benefits';
import Ingredients from './Ingredients';
import ProductSection from './ProductSection';
import OrderForm from './OrderForm';
import Footer from './Footer';
import CartSheet from './CartSheet';
import productsData from '@/data/products.json';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Benefits />
      <Ingredients />
      
      <main id="products" className="container mx-auto px-4">
        <ProductSection
          title="Cookies"
          description="Crispy and delicious dry cookies, perfect for snacks or gifts"
          products={productsData.cookies}
          icon="/cookies-icon.jpeg"
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

      <section id="order" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <OrderForm />
        </div>
      </section>

      <Footer />
      <CartSheet />
      <Toaster />
    </div>
  );
}