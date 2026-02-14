import Header from './Header';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';
import {
  Home,
  Sprout,
  Dumbbell,
  Package,
  Store,
  Heart,
  Leaf,
  Gift,
  ScrollText,
  HandFist,
  ChefHat,
  Salad,
  HeartHandshake,
  Rose,
  Goal,
  ArrowsUpFromLine,
  Sparkle
} from 'lucide-react';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5EEE8' }}>
      <Header />

      <main className="content-section md:!pt-[6rem]" style={{ paddingTop: 'var(--mobile-header-height-2)' }}>
        {/* Hero Section */}
        <div className="card-standard text-center mb-8 mt-8 md:mt-20 md:mb-16">
          <span className="badge badge-primary mb-6 inline-flex items-center gap-2">
            <ScrollText className="w-4 h-4" />
            Our Journey
          </span>

          <h1 className="heading-xl font-montserrat mb-6">
            Our Story
          </h1>

          <p className="body-lg mx-auto">
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
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg p-1 bg-secondary/10">
                    <span className="font-bold text-lg text-secondary">2019</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm font-montserrat-heading mb-4 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-secondary" />
                    The Beginning
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
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg p-1 bg-primary/20">
                    <span className="font-bold text-xs text-center leading-tight text-secondary">
                      PANDEMIC
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm font-montserrat-heading mb-4 flex items-center gap-2">
                    <HandFist className="w-5 h-5 text-secondary" />
                    Growing Through Challenges
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
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg p-1 bg-secondary/10">
                    <HeartHandshake className="w-6 h-6 text-secondary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm font-montserrat-heading mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-secondary" />
                    Quality Over Quantity
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
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg p-1 bg-primary/20">
                    <span className="font-bold text-lg text-secondary">2024</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm font-montserrat-heading mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-secondary" />
                    Growing Family
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
            <div className="mb-4">
              <Goal className="w-10 h-10 mx-auto text-secondary" />
            </div>
            <blockquote className="heading-md italic mb-6">
              "Because that's exactly what we're doing — creating homemade happiness, one cookie at a time."
            </blockquote>
            <p className="body-sm">— The Tiny Bitty Family</p>
          </div>

          {/* Values Section */}
          <div className="card-standard">
            <h2 className="heading-lg font-montserrat text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto mb-4">
                  <img
                    src="https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker2_fzyyfq.jpg"
                    alt="Artisanal"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto border-2 border-secondary/20 shadow-sm"
                  />
                </div>
                <h4 className="font-bold text-secondary mb-2">Artisanal Craftsmanship</h4>
                <p className="body-sm">Handmade. Small batch. Precision in every bite.</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4">
                  <img
                    src="https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker1_bgdbvs.jpg"
                    alt="Premium"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto border-2 border-secondary/20 shadow-sm"
                  />
                </div>
                <h4 className="font-bold text-secondary mb-2">Premium Ingredients</h4>
                <p className="body-sm">Fresh. Real. Carefully selected.</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4">
                  <img
                    src="https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker3_q0kfsb.jpg"
                    alt="Delivery"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto border-2 border-secondary/20 shadow-sm"
                  />
                </div>
                <h4 className="font-bold text-secondary mb-2">Thoughtful Delivery</h4>
                <p className="body-sm">Securely packed. Freshly delivered. Thoughtfully handled.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
