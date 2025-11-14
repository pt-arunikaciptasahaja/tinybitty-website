import Header from './Header';
import Ingredients from './Ingredients';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

export default function IngredientsPage() {
  return (
    <div className="min-h-screen bg-[#fffdf8]">
      <Header />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 space-y-10 md:space-y-12">
          {/* Page intro */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#edadc3]/20 text-sm text-[#553d8f] patrick-hand-sc-regular mb-3">
              🥚 Our Ingredients Story
            </span>
            <h1 className="text-3xl md:text-5xl bebas-neue-regular text-[#553d8f] mb-3">
              Our Premium Ingredients
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto patrick-hand-sc-regular">
              Peek behind the oven: see what goes into every Tiny Bitty cookie and why each bite
              tastes like home.
            </p>
          </div>

          {/* Main ingredients section */}
          <Ingredients />
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}