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
          description="Kue kering lezat yang crunchy, ideal untuk cemilan harian atau sebagai hampers istimewa."
          products={productsData.cookies}
          icon="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763576128/cookies-icon_rhytdc.png"
        />
        
        <ProductSection
          title="Tiny Juice"
          description="Jus alami tanpa pengawet, diolah dari buah segar berkualitas—cocok diminum kapan pun kamu butuh penyegar yang alami."
          products={productsData.juice}
          icon="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574654/curut_kqs4g5.png"
        />
        
        <ProductSection
          title="Macaroni Schotel"
          description="Macaroni panggang dengan saus keju gurih dan super creamy—sempurna untuk makan siang, makan malam, atau sekadar craving sesuatu yang enak."
          products={productsData.macaroni}
          icon="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574654/mac-icon_kuyjid.png"
        />
      </main>

      <OrderForm />

      <Footer />
      <Toaster />
    </div>
  );
}