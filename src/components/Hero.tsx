import { Button } from '@/components/ui/button';
import { Grid3X3 } from 'lucide-react';

export default function Hero() {

  return (
    <section
      className="
        mb-4 md:mb-8

        /* mobile: tighter spacing with 100px push to bottom */
        mt-[130px]

        /* tablet & desktop: normal spacing */
        md:mt-40 lg:mt-48
      "
    >
      <div
        className="cookie-texture rounded-2xl p-4 md:p-8 lg:p-10 h-[240px] lg:h-[370px] overflow-hidden relative pt-40 pb-8 md:pt-64 md:pb-40 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574663/hero_upprpg.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 text-center">
          <div className="max-w-3xl mx-auto">

            {/* Smaller title on mobile, better positioning */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl delius-regular mb-4 md:mb-6 leading-tight text-[#F4EEFF] tracking-wide -translate-y-32 md:translate-y-4 drop-shadow-2xl md:drop-shadow-lg">
              The Taste of Home,<br />
              Without Leaving Yours
            </h1>

            <div className="flex justify-center">
              <Button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#553d8f] hover:bg-[#553d8f]/90 text-white px-8 flex items-center justify-center gap-2 rounded-full font-light text-base shadow-lg hover:shadow-xl transition-all duration-300 -mt-[128px] md:mt-12 md:px-12 md:py-8 md:text-3xl"
              >
                <Grid3X3 className="w-5 h-5 md:w-10 md:h-10" />
                Browse Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}