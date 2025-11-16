import { Button } from '@/components/ui/button';

export default function Hero() {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
        <section
          className="
            mb-12 md:mb-16

            /* mobile: align with header */
            mt-4

            /* tablet & desktop: normal spacing */
            md:mt-40 lg:mt-48
          "
        >
        <div
          className="cookie-texture hero-mask rounded-2xl p-6 md:p-8 lg:p-10 overflow-hidden relative pt-56 pb-20 md:pt-64 md:pb-40 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/section-5.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/10 md:from-transparent md:via-black/5 md:to-transparent"></div>

        <div className="relative z-10 text-center">
          <div className="max-w-3xl mx-auto">

            {/* Title moved UP on mobile only */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl bebas-neue-regular mb-6 leading-tight text-white tracking-wide -translate-y-6 md:translate-y-0 drop-shadow-2xl md:drop-shadow-lg">
              The Taste of Home,<br />
              Without Leaving Yours
            </h1>

            <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Every cookie baked with care, every juice made fresh from real fruit,
              every dish made like we're cooking for family.
              <br className="hidden md:block" />
              Because that's exactly what we're doing. Order via WhatsApp!
            </p>

            <div className="flex justify-center">
                        <Button
                          onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                          className="bg-[#553d8f] hover:bg-[#553d8f]/90 text-white px-6 py-2.5 rounded-full font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Order Now!
                        </Button>
                      </div>
          </div>
        </div>
      </div>
    </section>
  );
}
