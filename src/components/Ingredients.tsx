export default function Ingredients() {
  return (
    <section
      className="
        cookie-texture 
        rounded-3xl md:rounded-[2rem] 
        p-6 md:p-8 lg:p-10
        bg-orange-50/70
        shadow-sm
        relative
        overflow-hidden
      "
      style={{
        opacity: 0.92,
        backgroundSize: "48px 48px",
        filter: "brightness(1.03) saturate(0.95)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,minmax(0,1fr)] gap-8 md:gap-10 items-center">

        {/* LEFT CONTENT */}
        <div className="space-y-6 md:space-y-8">

          {/* Header */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-white/80 rounded-full text-xs md:text-sm text-[#553d8f] font-medium mb-2">
              ✨ Quality Ingredients, Honest Recipes
            </span>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#553d8f] leading-tight">
              Real Ingredients You{' '}
              <span className="text-[#edadc3]">Know and Love</span>
            </h2>
          </div>

          <p className="text-base md:text-lg text-gray-700 max-w-xl leading-relaxed">
            We believe cookies should taste like home. That’s why we bake with real eggs,
            butter, flour, and pure cane sugar. Nothing artificial—only ingredients we
            trust and use in our own kitchen.
          </p>

          {/* Ingredient Chips */}
          <div className="flex flex-wrap gap-2 md:gap-3 mt-4">

            {/* Butter */}
            <span className="px-4 py-1.5 bg-[#fde8e8] text-[#b91c1c] rounded-full text-sm font-medium border border-[#fbcfd0] shadow-sm">
              🧈 Butter
            </span>

            {/* Eggs */}
            <span className="px-4 py-1.5 bg-[#fef3c7] text-[#92400e] rounded-full text-sm font-medium border border-[#fde68a] shadow-sm">
              🥚 Eggs
            </span>

            {/* Flour */}
            <span className="px-4 py-1.5 bg-[#e0f2fe] text-[#0369a1] rounded-full text-sm font-medium border border-[#bae6fd] shadow-sm">
              🌾 Flour
            </span>

            {/* Sugar */}
            <span className="px-4 py-1.5 bg-[#f3e8ff] text-[#6b21a8] rounded-full text-sm font-medium border border-[#e9d5ff] shadow-sm">
              🍬 Sugar
            </span>

            {/* Cheese */}
            <span className="px-4 py-1.5 bg-[#fff7e6] text-[#b45309] rounded-full text-sm font-medium border border-[#fdecc8] shadow-sm">
              🧀 Cheese
            </span>

            {/* Cinnamon */}
            <span className="px-4 py-1.5 bg-[#fce7d6] text-[#9a3412] rounded-full text-sm font-medium border border-[#f8d4ba] shadow-sm">
              🌿 Cinnamon
            </span>

            {/* Brown Sugar */}
            <span className="px-4 py-1.5 bg-[#f4e7d5] text-[#92400e] rounded-full text-sm font-medium border border-[#ecd7b9] shadow-sm">
              🍯 Brown Sugar
            </span>

          </div>


          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

            {/* Card 1 */}
            <div className="
              bg-white/90 
              rounded-2xl 
              p-5 md:p-6 
              text-left 
              border border-[#a3e2f5]/30 
              shadow-sm 
              hover:shadow-md 
              hover:-translate-y-0.5 
              transition-all duration-300
            ">
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-[#553d8f]">
                Always Natural, Always Delicious
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                No preservatives. No artificial flavors. Just clean, honest ingredients
                that create warm, fresh-from-the-oven flavor.
              </p>
            </div>

            {/* Card 2 */}
            <div className="
              bg-white/90 
              rounded-2xl 
              p-5 md:p-6 
              text-left 
              border border-[#a3e2f5]/30 
              shadow-sm 
              hover:shadow-md 
              hover:-translate-y-0.5 
              transition-all duration-300
            ">
              <div className="text-3xl mb-3">🏠</div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-[#553d8f]">
                Baked with Care, Sourced with Purpose
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Our ingredients are selected from trusted partners—ensuring every batch
                tastes rich, comforting, and crafted with care.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative">
          <div className="
            rounded-3xl 
            overflow-hidden 
            border border-[#a3e2f5]/40 
            shadow-md 
            bg-white/70
          ">
            <img
              src="/our-ingredients.png"
              alt="Tiny Bitty baking ingredients"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Soft pastel glow */}
          <div className="absolute -z-10 inset-4 rounded-3xl bg-[#edadc3]/30 blur-2xl opacity-60" />
        </div>

      </div>
    </section>
  );
}