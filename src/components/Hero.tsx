import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function Hero() {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="
        mb-4 md:mb-8

        /* mobile: tighter spacing */
        mt-4

        /* tablet & desktop: normal spacing */
        md:mt-40 lg:mt-48
      "
    >
      <div
        className="cookie-texture hero-mask rounded-2xl p-4 md:p-8 lg:p-10 overflow-hidden relative pt-40 pb-8 md:pt-64 md:pb-40 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/hero.png)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/15 md:from-black/30 md:via-black/20 md:to-transparent"></div>

        <div className="relative z-10 text-center">
          <div className="max-w-3xl mx-auto">

            {/* Smaller title on mobile, better positioning */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl delius-regular mb-4 md:mb-6 leading-tight text-[#F4EEFF] tracking-wide -translate-y-12 md:translate-y-4 drop-shadow-2xl md:drop-shadow-lg">
              The Taste of Home,<br />
              Without Leaving Yours
            </h1>

            <div className="flex justify-center">
              <Button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#553d8f] hover:bg-[#553d8f]/90 text-white px-8 flex items-center justify-center gap-2 rounded-full font-light text-base shadow-lg hover:shadow-xl transition-all duration-300 -mt-4 md:mt-0 md:px-8 md:py-3 md:text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Chat to Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}