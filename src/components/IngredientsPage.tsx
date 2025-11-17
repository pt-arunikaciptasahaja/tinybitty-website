import Header from './Header';
import Ingredients from './Ingredients';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

export default function IngredientsPage() {
  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 xl:px-16" style={{ backgroundColor: '#f5f7f7' }}>
      <Header />

      <main className="content-section">
        {/* Page intro */}
        <div className="card-standard text-center max-w-3xl mx-auto mb-12 mt-16">
          <span className="badge badge-secondary mb-4">
            🥚 Our Ingredients Story
          </span>
          <h1 className="heading-lg mb-4">
            Our Premium Ingredients
          </h1>
          <p className="body-lg max-w-2xl mx-auto">
            Peek behind the oven: see what goes into every Tiny Bitty cookie and why each bite
            tastes like home.
          </p>
        </div>

        {/* Main ingredients section */}
        <div className="card-elevated">
          <Ingredients />
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}