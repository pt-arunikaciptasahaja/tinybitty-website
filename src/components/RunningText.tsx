import { motion } from "framer-motion";

const upperText = ["COOKIES ✨", "JUICE ✨", "MACARONI SCHOTEL ✨"];
const bottomText = [
  " 🍪 NEW! Cheese Almond NEW!",
  " 🍪 Choco Almond",
  " 🍪 Heavenly Bites",
  " 🍪 Oatmeal Raisin",
];

export default function RunningText() {
  return (
    <div className="overflow-hidden py-3 md:py-6 mb-12 md:mb-16 rounded-xl bg-[#553d8f]">
      {/* LEFT → RIGHT */}
      <Marquee
        items={upperText}
        size="text-xl md:text-4xl"
        speed={35}
        direction="right"
      />

      {/* RIGHT → LEFT */}
      <Marquee
        items={bottomText}
        size="text-base md:text-2xl"
        speed={45}
        direction="left"
      />
    </div>
  );
}

function Marquee({ items, size, speed, direction }: any) {
  // Standard distance (move 1 of 3 blocks)
  const distance = "66.666%";

  // If direction = right → reverse the animation
  const animateX =
    direction === "right"
      ? ["-66.666%", "0%"]
      : ["0%", "-66.666%"];

  return (
    <div className="overflow-hidden whitespace-nowrap mt-2 md:mt-3">
      <motion.div
        className="flex"
        animate={{ x: animateX }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* Triple block for seamless loop */}
        <Block items={items} size={size} />
        <Block items={items} size={size} />
        <Block items={items} size={size} />
      </motion.div>
    </div>
  );
}

function Block({ items, size }: any) {
  return (
    <div className="flex mx-4 md:mx-6 gap-8 md:gap-12">
      {items.map((item: string, i: number) => (
        <span
          key={i}
          className={`text-white font-extrabold tracking-wider ${size}`}
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
