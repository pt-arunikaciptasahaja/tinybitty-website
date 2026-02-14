import Header from './Header';
import Ingredients from './Ingredients';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';
import { Sparkles, Sun, Star, Heart } from 'lucide-react';

export default function IngredientsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5EEE8' }}>
      <Header />

      <main className="content-section md:!pt-[6rem]" style={{ paddingTop: 'var(--mobile-header-height-2)' }}>
        {/* Hero Section */}
        <div className="card-standard text-center mb-8 mt-8 md:mt-20 md:mb-16">
          <span className="badge badge-primary mb-6 inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Our Ingredients Story
          </span>

          <h1 className="heading-xl font-montserrat mb-6">
            Our Premium Ingredients
          </h1>

          <p className="body-lg mx-auto">
            Peek behind the oven: see what goes into every Tiny Bitty cookie and why each bite tastes like home.
          </p>
        </div>

        {/* Main ingredients section */}
        <div className="content-spacing">
          <Ingredients />

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card-standard text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="text-white h-6 w-6" />
              </div>
              <h4 className="font-bold text-secondary mb-2">Baked Fresh Daily</h4>
              <p className="body-sm">Every batch is made to order with ingredients that are as fresh as they are flavorful</p>
            </div>

            <div className="card-standard text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-secondary h-6 w-6" />
              </div>
              <h4 className="font-bold text-secondary mb-2">Premium Quality</h4>
              <p className="body-sm">We source only the finest ingredients from trusted suppliers who share our values</p>
            </div>

            <div className="card-standard text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white h-6 w-6" />
              </div>
              <h4 className="font-bold text-secondary mb-2">Made with Love</h4>
              <p className="body-sm">Every cookie is crafted with care, passion, and a sprinkle of sweetness in every bite</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
