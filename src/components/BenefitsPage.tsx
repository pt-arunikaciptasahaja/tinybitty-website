import Header from './Header';
import Benefits from './Benefits';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl bebas-neue-regular text-[#553d8f] mb-4">
              Why Choose Tiny Bitty?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what makes our homemade treats and fresh juices special
            </p>
          </div>
          <Benefits />
        </div>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}
