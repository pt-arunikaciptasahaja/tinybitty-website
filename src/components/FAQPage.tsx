import Header from './Header';
import FAQ from './FAQ';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 xl:px-16" style={{ backgroundColor: '#f5f7f7' }}>
      <Header />

      <main className="content-section md:!pt-[6rem]" style={{ paddingTop: 'var(--mobile-header-height-2)' }}>
        {/* Hero Section */}
        <div className="card-standard text-center mb-8 mt-16">
          <span className="badge badge-primary mb-6 inline-flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </span>
          
          <h1 className="heading-xl mb-6">
            Got Questions?
          </h1>
          
          <p className="body-lg max-w-2xl mx-auto">
            Find answers to the most common questions about our products, ordering, delivery, and more.
          </p>
        </div>

        {/* Main FAQ section */}
        <div className="content-spacing">
          <FAQ />
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
