import { Button } from '@/components/ui/button';

export default function Hero() {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="relative overflow-hidden py-1"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23cbb3f0\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}
    >
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* CSS-Based Falling Cookies Animation */}
          <div className="absolute top-0 left-0 w-full h-[200vh] opacity-60 pointer-events-none z-0">
            <div className="relative w-full h-full">
              {/* Falling Cookie 1 */}
              <div className="absolute falling-cookie cookie-1"></div>
              {/* Falling Cookie 2 */}
              <div className="absolute falling-cookie cookie-2"></div>
              {/* Falling Cookie 3 */}
              <div className="absolute falling-cookie cookie-3"></div>
              {/* Falling Cookie 4 */}
              <div className="absolute falling-cookie cookie-4"></div>
              {/* Falling Cookie 5 */}
              <div className="absolute falling-cookie cookie-5"></div>
              {/* Falling Cookie 6 */}
              <div className="absolute falling-cookie cookie-6"></div>
              {/* Falling Cookie 7 */}
              <div className="absolute falling-cookie cookie-7"></div>
              {/* Falling Cookie 8 */}
              <div className="absolute falling-cookie cookie-8"></div>
            </div>
          </div>
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-[#553d8f] shadow-md">
              ✨ Homemade with Love
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-[#553d8f] font-bold knewave-regular text-center">
            The Taste of Home, Without Leaving Yours
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto patrick-hand-sc-regular">
            Every cookie baked with care, every juice made fresh from real fruit, 
            every dish made like we're cooking for family. 
            Because that's exactly what we're doing. Order via WhatsApp!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="bg-[#edadc3] hover:bg-[#edadc3]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6 rounded-full"
            >
              View Products
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-[#553d8f] text-[#553d8f] hover:bg-[#553d8f]/10 text-lg px-8 py-6 rounded-full"
            >
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}