import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function Hero() {

  return (
    <section className="mt-10 md:mt-30 mb-2 md:mb-4 pt-16 md:pt-32 pb-0">
      <div className="w-full max-w-[1400px] mx-auto px-0">
        <div
          className="rounded-3xl p-4 md:p-8 lg:p-10 min-h-[140px] md:min-h-[320px] lg:min-h-[370px] overflow-hidden relative flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://res.cloudinary.com/dodmwwp1w/image/upload/v1763787147/hero_upprpg_1_cvrvne.png")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 text-center px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl delius-regular mb-4 md:mb-6 leading-tight text-[#F4EEFF] tracking-wide drop-shadow-2xl md:drop-shadow-lg">
              The Taste of Home,<br />
              Without Leaving Yours
            </h1>

            <div className="flex justify-center w-full">
              <Button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#553d8f] hover:bg-[#553d8f]/90 text-white px-4 py-2 md:px-8 md:py-6 flex items-center justify-center gap-2 rounded-full font-light text-sm md:text-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Menu className="w-4 h-4 md:w-6 md:h-6" />
                Lihat Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}