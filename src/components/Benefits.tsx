export default function Benefits() {
  const benefits = [
    {
      icon: "🍪",
      title: "Baked Fresh Daily",
      description: "Crispy cookies straight from the oven, warming hearts and enhancing daily potential"
    },
    {
      icon: "🧃",
      title: "100% Fresh Juice",
      description: "Fresh fruit juice without preservatives, naturally sweet from the best quality fruits"
    },
    {
      icon: "🧀",
      title: "Creamy Mac Schotel",
      description: "Nusantara flavors with modern touch, pleasures that often make you crave for more"
    },
    {
      icon: "💖",
      title: "Made with Love",
      description: "Every bite contains a love story, specially made with full attention"
    }
  ];

  return (
    <section
      className="mb-12 md:mb-16 py-16"
      style={{
        backgroundColor: '#fff',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23eba92c\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-[#a3e2f5]/30 text-[#553d8f] rounded-full text-sm font-medium">
              ✨ The Good Stuff
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#11110a] mb-4 knewave-regular">
            <span className="text-[#11110a]">Authentic Taste</span> from{" "}
            <span className="text-[#edadc3]">the Heart!</span>
          </h2>
          <p className="text-lg text-[#11110a]/80 mx-auto patrick-hand-sc-regular">
            From a kitchen full of love to your table - every product contains warmth and deliciousness that brightens your day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-none mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:bg-white/40 transition-all duration-300 h-full">
                <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 text-center">
                  {benefit.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#11110a] mb-3 group-hover:text-[#553d8f] transition-colors duration-300 text-center patrick-hand-sc-regular">
                  {benefit.title}
                </h3>
                <p className="text-[#11110a]/70 text-md md:text-base leading-relaxed text-center patrick-hand-sc-regular">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}