import { Button } from '@/components/ui/button';

export default function Hero() {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative pt-32 pb-20 md:pt-40 md:pb-32"
      style={{
        backgroundImage: 'url(/section-5.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        maskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {/* <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-[#553d8f] border border-white/20">
              ✨ Homemade with Love
            </span>
          </div> */}
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl bebas-neue-regular mb-6 leading-tight text-white tracking-wide">
            The Taste of Home,<br />
            Without Leaving Yours
          </h1>
          
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Every cookie baked with care, every juice made fresh from real fruit,
            every dish made like we're cooking for family.
            <br className="hidden md:block" />
            Because that's exactly what we're doing. Order via WhatsApp!
          </p>
          
          <div className="flex justify-center">
            <Button
              onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#f9c2cd] hover:bg-[#f9c2cd]/90 text-white px-6 py-2.5 rounded-full font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Order Now!
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}