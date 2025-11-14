import Header from './Header';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f0] via-[#fefcf8] to-[#f7f3e8]">
      <Header />
      <div className="pt-32">
        {/* Hero Section */}
        <section className="py-2 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <span className="inline-block px-6 py-3 bg-[#f9c2cd]/20 rounded-full text-sm font-medium text-[#553d8f] border border-[#f9c2cd]/30">
                  🏠 Our Journey
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl bebas-neue-regular text-[#553d8f] mb-6 leading-tight">
                Our Story
              </h1>
              
              <p className="text-lg md:text-xl text-[#11110a]/70 max-w-2xl mx-auto leading-relaxed">
                From a small backyard oven to your heart, discover how Tiny Bitty became a beloved part of so many families.
              </p>
            </div>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Timeline Style Story */}
              <div className="space-y-12">
                
                {/* Chapter 1 */}
                <div className="relative">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-[#f9c2cd] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">2019</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#f9c2cd]/20">
                        <h3 className="text-xl font-bold text-[#553d8f] mb-4 flex items-center gap-2">
                          🌱 The Beginning
                        </h3>
                        <p className="text-[#11110a]/80 leading-relaxed">
                          Tiny Bitty began in 2019, starting from a small backyard oven and a simple dream: 
                          to create cookies that feel homemade, honest, and comforting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter 2 */}
                <div className="relative">
                  <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
  <div className="w-20 h-20 bg-[#553d8f] rounded-full flex items-center justify-center shadow-lg p-1">
    <span className="text-white font-bold text-xs text-center leading-tight">
      PANDEMIC
    </span>
  </div>
</div>

                    <div className="flex-1">
                      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#edadc3]/20">
                        <h3 className="text-xl font-bold text-[#553d8f] mb-4 flex items-center gap-2">
                          💪 Growing Through Challenges
                        </h3>
                        <p className="text-[#11110a]/80 leading-relaxed">
                          Through the challenges of the pandemic, Tiny Bitty continued to grow — supported by 
                          customers who believed in its flavors and its story. From those early days, the brand 
                          expanded its reach, delivering cookies all the way from Sumatra to Sulawesi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter 3 */}
                <div className="relative">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-[#a3e2f5] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">📦</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#a3e2f5]/20">
                        <h3 className="text-xl font-bold text-[#553d8f] mb-4 flex items-center gap-2">
                          💝 Quality Over Quantity
                        </h3>
                        <p className="text-[#11110a]/80 leading-relaxed">
                          Along the way, Tiny Bitty learned something important: fragile, handcrafted cookies 
                          deserve special care. Long-distance shipping often wasn't kind to them, so the brand 
                          made a thoughtful decision to focus deliveries only within Jabodetabek and Bandung, 
                          ensuring every cookie arrives fresh and intact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter 4 */}
                <div className="relative">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-[#553d8f] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">2024</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#553d8f]/20">
                        <h3 className="text-xl font-bold text-[#553d8f] mb-4 flex items-center gap-2">
                          🏪 Growing Family
                        </h3>
                        <p className="text-[#11110a]/80 leading-relaxed">
                          In 2024, Tiny Bitty introduced new members to its family — Tiny Juice and Macaroni Schotel, 
                          expanding the brand's homemade goodness while staying true to its roots: simple ingredients, 
                          warm flavors, and a commitment to quality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quote Section */}
              <div className="mt-16 text-center">
                <div className="bg-gradient-to-r from-[#f9c2cd]/10 to-[#edadc3]/10 rounded-3xl p-8 border border-[#f9c2cd]/20">
                  <div className="text-4xl mb-4">💖</div>
                  <blockquote className="text-xl md:text-2xl font-medium text-[#553d8f] italic mb-4">
                    "Because that's exactly what we're doing — creating homemade happiness, one cookie at a time."
                  </blockquote>
                  <p className="text-[#11110a]/60">— The Tiny Bitty Family</p>
                </div>
              </div>

              {/* Values Section */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#f9c2cd] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🏠</span>
                  </div>
                  <h4 className="font-bold text-[#553d8f] mb-2">Homemade</h4>
                  <p className="text-sm text-[#11110a]/70">Every product made with love and care</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#edadc3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🌿</span>
                  </div>
                  <h4 className="font-bold text-[#553d8f] mb-2">Quality</h4>
                  <p className="text-sm text-[#11110a]/70">Only the best ingredients make the cut</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#a3e2f5] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">💝</span>
                  </div>
                  <h4 className="font-bold text-[#553d8f] mb-2">Care</h4>
                  <p className="text-sm text-[#11110a]/70">Your satisfaction is our priority</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}
