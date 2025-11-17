import Header from './Header';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 xl:px-16" style={{ backgroundColor: '#f5f7f7' }}>
      <Header />

      <main className="content-section">
        {/* Hero Section */}
        <div className="card-standard text-center mb-8 mt-16">
          <span className="badge badge-primary mb-6">
            🏠 Our Journey
          </span>
          
          <h1 className="heading-xl mb-6">
            Our Story
          </h1>
          
          <p className="body-lg max-w-2xl mx-auto">
            From a small backyard oven to your heart, discover how Tiny Bitty became a beloved part of so many families.
          </p>
        </div>

        {/* Story Content */}
        <div className="content-spacing">
          {/* Single Card with All Chapters */}
          <div className="card-standard">
            {/* Timeline Style Story */}
            <div className="space-y-8">
              
              {/* Chapter 1 */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">2019</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-4 flex items-center gap-2">
                    🌱 The Beginning
                  </h3>
                  <p className="body-base">
                    Tiny Bitty began in 2019, starting from a small backyard oven and a simple dream:
                    to create cookies that feel homemade, honest, and comforting.
                  </p>
                </div>
              </div>

              {/* Chapter 2 */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg p-1">
                    <span className="text-primary-foreground font-bold text-xs text-center leading-tight">
                      PANDEMIC
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-4 flex items-center gap-2">
                    💪 Growing Through Challenges
                  </h3>
                  <p className="body-base">
                    Through the challenges of the pandemic, Tiny Bitty continued to grow — supported by
                    customers who believed in its flavors and its story. From those early days, the brand
                    expanded its reach, delivering cookies all the way from Sumatra to Sulawesi.
                  </p>
                </div>
              </div>

              {/* Chapter 3 */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">📦</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-4 flex items-center gap-2">
                    💝 Quality Over Quantity
                  </h3>
                  <p className="body-base">
                    Along the way, Tiny Bitty learned something important: fragile, handcrafted cookies
                    deserve special care. Long-distance shipping often wasn't kind to them, so the brand
                    made a thoughtful decision to focus deliveries only within Jabodetabek and Bandung,
                    ensuring every cookie arrives fresh and intact.
                  </p>
                </div>
              </div>

              {/* Chapter 4 */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">2024</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-4 flex items-center gap-2">
                    🏪 Growing Family
                  </h3>
                  <p className="body-base">
                    In 2024, Tiny Bitty introduced new members to its family — Tiny Juice and Macaroni Schotel,
                    expanding the brand's homemade goodness while staying true to its roots: simple ingredients,
                    warm flavors, and a commitment to quality.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Quote Section */}
          <div className="card-standard text-center">
            <div className="text-4xl mb-4">💖</div>
            <blockquote className="heading-md italic mb-6">
              "Because that's exactly what we're doing — creating homemade happiness, one cookie at a time."
            </blockquote>
            <p className="body-sm">— The Tiny Bitty Family</p>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-standard text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-xl">🏠</span>
              </div>
              <h4 className="font-bold text-primary mb-2">Homemade</h4>
              <p className="body-sm">Every product made with love and care</p>
            </div>
            
            <div className="card-standard text-center">
              <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">🌿</span>
              </div>
              <h4 className="font-bold text-primary mb-2">Quality</h4>
              <p className="body-sm">Only the best ingredients make the cut</p>
            </div>
            
            <div className="card-standard text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-xl">💝</span>
              </div>
              <h4 className="font-bold text-primary mb-2">Care</h4>
              <p className="body-sm">Your satisfaction is our priority</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
