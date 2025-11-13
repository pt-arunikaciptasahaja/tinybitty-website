import Lottie from 'lottie-react';
import cookieAnimation from '@/data/cookie_bite_crumbs_bounce.json';

export default function Ingredients() {
  return (
    <section
      className="relative py-20 md:py-32 bg-cover bg-center bg-no-repeat mb-5"
      style={{
        backgroundImage: "url('/our-ingredients.png')"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          
          {/* Section Header with Animation */}
            
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-md text-[#f5fbf8] patrick-hand-sc-regular mb-6">
              ✨ Quality Ingredients
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f5fbf8] mb-4 knewave-regular">
              Real Ingredients You{" "}
              <span className="text-[#edadc3]">Know and Love</span>
            </h2>
            <p className="text-lg text-[#f5fbf8]/80 max-w-2xl mx-auto patrick-hand-sc-regular mb-2">
              We believe cookies should taste like home. That's why we bake with real eggs, butter,
              flour, and pure cane sugar. Nothing you can't pronounce and nothing we wouldn't use
              in our own kitchens!
            </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Always Natural Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#edadc3]">
                Always Natural, Always Delicious
              </h3>
              <p className="text-white/90 leading-relaxed patrick-hand-sc-regular text-lg">
                No preservatives. No artificial flavors. No weird stuff. Just simple, honest ingredients
                that give every cookie that fresh-from-the-oven flavor because great taste doesn't need shortcuts.
              </p>
            </div>

            {/* Baked with Care Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#edadc3]">
                Baked with Care, Sourced with Purpose
              </h3>
              <p className="text-white/90 leading-relaxed patrick-hand-sc-regular text-lg">
                We choose premium, high-quality ingredients from trusted partners. From creamy butter
                to farm-fresh eggs, every bite of our cookies is crafted to be as feel-good as it is crave-worthy.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}