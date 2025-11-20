import { Sparkles, Leaf, Home } from 'lucide-react';

export default function Ingredients() {
  return (
    <div className="card-standard">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="badge badge-secondary mb-4 inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Quality Ingredients, Honest Recipes
        </span>

        <h2 className="heading-lg mb-4">
          Real Ingredients You{' '}
          <span className="text-[#553d8f]">Know and Love</span>
        </h2>

        <p className="body-base max-w-2xl mx-auto">
          We believe cookies should taste like home. That's why we bake with real eggs,
          butter, flour, and pure cane sugar. Nothing artificial—only ingredients we
          trust and use in our own kitchen.
        </p>
      </div>

      {/* Ingredient Chips */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8">
        <span className="px-4 py-1.5 bg-[#fde8e8] text-[#b91c1c] rounded-full text-sm font-medium border border-[#fbcfd0] shadow-sm">
          🧈 Butter
        </span>

        <span className="px-4 py-1.5 bg-[#fef3c7] text-[#92400e] rounded-full text-sm font-medium border border-[#fde68a] shadow-sm">
          🥚 Eggs
        </span>

        <span className="px-4 py-1.5 bg-[#e0f2fe] text-[#0369a1] rounded-full text-sm font-medium border border-[#bae6fd] shadow-sm">
          🌾 Flour
        </span>

        <span className="px-4 py-1.5 bg-[#f3e8ff] text-[#6b21a8] rounded-full text-sm font-medium border border-[#e9d5ff] shadow-sm">
          🍬 Sugar
        </span>

        <span className="px-4 py-1.5 bg-[#fff7e6] text-[#b45309] rounded-full text-sm font-medium border border-[#fdecc8] shadow-sm">
          🧀 Cheese
        </span>

        <span className="px-4 py-1.5 bg-[#fce7d6] text-[#9a3412] rounded-full text-sm font-medium border border-[#f8d4ba] shadow-sm">
          🌿 Cinnamon
        </span>

        <span className="px-4 py-1.5 bg-[#f4e7d5] text-[#92400e] rounded-full text-sm font-medium border border-[#ecd7b9] shadow-sm">
          🍯 Brown Sugar
        </span>
      </div>

      {/* Image */}
      <div className="mb-8">
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm mx-auto max-w-2xl">
          <img
            src="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574660/our-ingredients_eil5uh.png"
            alt="Tiny Bitty baking ingredients"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
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
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
              <Home className="h-6 w-6 text-primary-foreground" />
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
