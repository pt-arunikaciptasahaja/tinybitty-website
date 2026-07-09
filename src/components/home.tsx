import Header from './Header';
import Hero from './Hero';
import RunningText from './RunningText';
import ProductSection from './ProductSection';
import Testimonials from './Testimonials';
import HowToOrder from './HowToOrder';
import HampersSection from './HampersSection';
import OrderForm from './OrderForm';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F2' }}>
      <Header />
      <Hero />

      {/* <RunningText /> */}

      <main>
        <ProductSection />
      </main>

      {/* <HampersSection /> */}

      <HowToOrder />

      {/* <Testimonials /> */}

      <OrderForm />

      <Footer />
      <Toaster />
    </div>
  );
}
