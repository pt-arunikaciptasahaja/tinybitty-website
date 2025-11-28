import Header from './Header';
import Hero from './Hero';
import RunningText from './RunningText';
import ProductSection from './ProductSection';
import PromoBanner from './PromoBanner';
import HowToOrder from './HowToOrder';
import OrderForm from './OrderForm';
import Footer from './Footer';
import productsData from '@/data/products.json';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  // Sort products to show items with isNew badge first
  const sortedCookies = [...productsData.cookies].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return 0;
  });

  const sortedJuice = [...productsData.juice].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return 0;
  });

  const sortedMacaroni = [...productsData.macaroni].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f7f7' }}>
      <Header />
      <Hero />
      
      <RunningText />
      
      <main id="products">
        <ProductSection
          title="Cookies"
          description="Kue kering lezat yang crunchy, ideal untuk cemilan harian atau sebagai hampers istimewa."
          products={sortedCookies}
          icon="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763576128/cookies-icon_rhytdc.png"
        />
        
        <ProductSection
          title="Tiny Juice"
          description="Jus alami tanpa pengawet, diolah dari buah segar berkualitas—cocok diminum kapan pun kamu butuh penyegar yang alami."
          products={sortedJuice}
          icon="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574654/curut_kqs4g5.png"
        />
        
        <ProductSection
          title="Macaroni Schotel"
          description="Macaroni panggang dengan saus keju gurih dan super creamy—sempurna untuk makan siang, makan malam, atau sekadar craving sesuatu yang enak."
          products={sortedMacaroni}
          icon="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574654/mac-icon_kuyjid.png"
        />
      </main>

      <PromoBanner />

      <HowToOrder />

      <OrderForm />

      <Footer />
      <Toaster />
    </div>
  );
}