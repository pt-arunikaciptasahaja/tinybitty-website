import Header from './Header';
import FAQ from './FAQ';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-32">
        <FAQ />
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}
