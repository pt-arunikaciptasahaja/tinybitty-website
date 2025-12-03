import { motion } from "framer-motion";

// Scroll to HampersSection function
const scrollToHampersSection = () => {
  const element = document.getElementById('hampers-section');
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// const upperText = ["COOKIES ✨", "JUICE ✨", "MACARONI SCHOTEL ✨"];
const upperText = [
  "HOLIDAY GOODIES 💜", 
  "SNACKS FOR SNUGGLY DAYS ❄️", 
  "LIL' TREATS FOR HAPPY MOMENTS ✨",
  "SWEET TREATS FOR WINTER 🌟",
  "COZY COOKIE BITES 🍪",
  "HOLIDAY HAMPER SPECIALS 🎁"
];


// Seasonal text - commented out for seasonal hampers
/*const bottomText = [
  " 🍪 Cheese Almond NEW!",
  " 🍪 Choco Almond",
  " 🍪 Heavenly Bites",
  " 🍪 Oatmeal Raisin",
];*/

// Hampers images from HampersSection product cards
const bottomImages = [
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693066/yupp-generated-image-497742_zdaako.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-570797_ekp6hg.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-565543_ukqomr.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764743725/yupp-generated-image-664995_1_vgsoen.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693066/yupp-generated-image-497742_zdaako.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-570797_ekp6hg.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-565543_ukqomr.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764743725/yupp-generated-image-664995_1_vgsoen.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693066/yupp-generated-image-497742_zdaako.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-570797_ekp6hg.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764693067/yupp-generated-image-565543_ukqomr.jpg",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1764743725/yupp-generated-image-664995_1_vgsoen.jpg",
];

export default function RunningText() {
  return (
    <div className="overflow-hidden py-3 md:py-6 mb-4 md:mb-6 rounded-xl bg-[#f5f7f7]">
      {/* LEFT → RIGHT */}
      <Marquee
        items={upperText}
        size="text-xl md:text-4xl"
        speed={100}
        direction="right"
        gap="gap-8 md:gap-6"
      />

      {/* RIGHT → LEFT */}
      <Marquee
        items={bottomImages}
        size="md:text-2xl"
        className="text-white md:text-2xl bg-[#C5B8FF] px-3 rounded-full"
        speed={30}
        direction="left"
        gap="gap-4"
      />
    </div>
  );
}

function Marquee({ items, size, speed = 25, direction = "left", className }: any) {
  // Treat `speed` as animation duration in seconds
  const duration = speed;

  const animateX =
    direction === "right"
      ? ["-50%", "0%"]   // scroll right
      : ["0%", "-50%"];  // scroll left

  return (
    <div className="relative overflow-hidden mt-2 md:mt-3">
      <motion.div
        className="flex w-max"  // ⬅️ key: shrink-wrap to content (like max-content)
        animate={{ x: animateX }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* Two copies of the same strip, like Dribbble's footer marquee */}
        <Block items={items} size={size} className={className} onImageClick={scrollToHampersSection} />
        <Block items={items} size={size} className={className} onImageClick={scrollToHampersSection} />
      </motion.div>
    </div>
  );
}


function Block({ items, size, className, onImageClick }: any) {
  return (
    <div className="flex gap-8 md:gap-6 pr-8 md:pr-10">
      {items.map((item: string, i: number) => {
        const isImage = item.startsWith("http");

        if (isImage) {
          return (
            <button
              key={i}
              onClick={onImageClick}
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-white shadow-lg flex-shrink-0 bg-white p-1 hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C5B8FF] focus:ring-offset-2 cursor-pointer"
              aria-label={`Lihat hamper ${i + 1}`}
            >
              <img
                src={item}
                alt={`Hamper ${i + 1}`}
                className="w-full h-full object-cover rounded-xl pointer-events-none"
                loading="lazy"
              />
            </button>
          );
        }

        return (
          <span
            key={i}
            className={`font-extrabold tracking-wider ${size} ${className || "text-[#553D8F]"}`}
            style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900 }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}


