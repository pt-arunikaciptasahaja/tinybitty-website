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
// Eid/Ramadan themed text
// Eid/Ramadan themed text with stickers
const upperText = [
  { text: "EID MUBARAK", sticker: "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker1_bgdbvs.jpg" },
  { text: "SWEET TREATS FOR RAMADAN", sticker: "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker2_fzyyfq.jpg" },
  { text: "SHARE THE JOY OF EID", sticker: "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker3_q0kfsb.jpg" },
  { text: "BITE-SIZED HAPPINESS", sticker: "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker1_bgdbvs.jpg" },
  { text: "CELEBRATE WITH TINY BITTY", sticker: "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker2_fzyyfq.jpg" },
  { text: "RAMADAN SPECIALS", sticker: "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771089201/sticker3_q0kfsb.jpg" }
];


// Seasonal text - commented out for seasonal hampers
/*const bottomText = [
  " 🍪 Desert Crown NEW!",
  " 🍪 Golden Crunch",
  " 🍪 Heavenly Bites",
  " 🍪 Harvest Haven",
];*/

// Hampers images from HampersSection product cards - Eid/Ramadan Collection
const bottomImages = [
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068682/ChatGPT_Image_Feb_14_2026_06_30_55_PM_ouyqsr.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1770745549/Gemini_Generated_Image_ulp3txulp3txulp3_nxct9q.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1770746119/Gemini_Generated_Image_wl95zjwl95zjwl95_jgqfln.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068507/Gemini_Generated_Image_927n25927n25927n_lxafuv.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068682/ChatGPT_Image_Feb_14_2026_06_30_55_PM_ouyqsr.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1770745549/Gemini_Generated_Image_ulp3txulp3txulp3_nxct9q.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1770746119/Gemini_Generated_Image_wl95zjwl95zjwl95_jgqfln.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068507/Gemini_Generated_Image_927n25927n25927n_lxafuv.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068682/ChatGPT_Image_Feb_14_2026_06_30_55_PM_ouyqsr.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1770745549/Gemini_Generated_Image_ulp3txulp3txulp3_nxct9q.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1770746119/Gemini_Generated_Image_wl95zjwl95zjwl95_jgqfln.png",
  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771068507/Gemini_Generated_Image_927n25927n25927n_lxafuv.png",
];

export default function RunningText() {
  return (
    <div className="overflow-hidden py-3 md:py-6 mb-4 md:mb-6 rounded-xl bg-background">
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
        className="text-white md:text-2xl bg-accent px-3 rounded-full"
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
    <div className="flex items-center gap-8 md:gap-6 pr-8 md:pr-10">
      {items.map((item: any, i: number) => {
        const isStringItem = typeof item === "string";
        const isImage = isStringItem && item.startsWith("http");

        if (isImage) {
          return (
            <button
              key={i}
              onClick={onImageClick}
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-white flex-shrink-0 bg-white p-1 hover:shadow-xl duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 cursor-pointer"
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

        // Handle object items (text + sticker)
        const text = isStringItem ? item : item.text;
        const sticker = !isStringItem ? item.sticker : null;

        return (
          <div key={i} className="flex items-center gap-4">
            <span
              className={`font-extrabold tracking-wider ${size} ${className || "text-secondary"}`}
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900 }}
            >
              {text}
            </span>
            {sticker && (
              <img
                src={sticker}
                alt="sticker"
                className="w-10 h-10 md:w-16 md:h-16 rounded-full object-cover border-2 border-secondary/20 shadow-sm"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}


