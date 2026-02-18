import { Sparkles, Leaf, Home, ThumbsUp, Vegan } from 'lucide-react';
import { cldThumb } from '@/lib/cdn';

export default function Ingredients() {
  return (
    <div className="card-standard">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="badge badge-secondary mb-4 inline-flex items-center gap-2">
          <ThumbsUp className="h-4 w-4" />
          Quality Ingredients, Honest Recipes
        </span>

        <h2 className="heading-lg font-montserrat mb-4">
          Real Ingredients You{' '}
          <span className="text-primary">Know and Love</span>
        </h2>

        <p className="body-base max-w-none mx-auto">
          We believe cookies should taste like home. That's why we bake with real eggs,
          butter, flour, and pure cane sugar. Nothing artificial—only ingredients we
          trust and use in our own kitchen.
        </p>
      </div>

      {/* Ingredient Chips */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8">
        {[
          "🧈 Butter", "🥚 Eggs", "🌾 Flour", "� Sugar",
          "🧀 Cheese", "🌿 Cinnamon", "🍯 Brown Sugar", "🍫 Choco Chips"
        ].map((ingredient, index) => (
          <span
            key={index}
            className="px-4 py-1.5 bg-secondary/5 text-secondary rounded-full text-sm font-medium border border-secondary/10 shadow-sm"
          >
            {ingredient}
          </span>
        ))}
      </div>

      {/* Image */}
      <div className="mb-8">
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm mx-auto max-w-none">
          <img
            src={cldThumb(
              "https://res.cloudinary.com/dodmwwp1w/image/upload/v1763787771/yupp-generated-image-830030_1_hmsris.png",
              { width: 800, quality: "auto:eco" },
            )}
            alt="Tiny Bitty baking ingredients"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <Vegan className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="heading-sm mb-2">
              Always Natural, Always Delicious
            </h3>
            <p className="body-sm">
              No preservatives. No artificial flavors. Just clean, honest ingredients
              that create warm, fresh-from-the-oven flavor.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="heading-sm mb-2">
              Baked with Care, Sourced with Purpose
            </h3>
            <p className="body-sm">
              Our ingredients are selected from trusted partners—ensuring every batch
              tastes rich, comforting, and crafted with care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
