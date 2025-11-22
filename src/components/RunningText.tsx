import { motion } from "framer-motion";

const upperText = ["COOKIES ✨", "JUICE ✨", "MACARONI SCHOTEL ✨"];
const bottomText = [
  " 🍪 Cheese Almond NEW!",
  " 🍪 Choco Almond",
  " 🍪 Heavenly Bites",
  " 🍪 Oatmeal Raisin",
];

export default function RunningText() {
  return (
    <div className="overflow-hidden py-3 md:py-6 mb-6 md:mb-6 rounded-xl bg-[#f5f7f7]">
      {/* LEFT → RIGHT */}
      <Marquee
        items={upperText}
        size="text-xl md:text-4xl"
        speed={25}
        direction="right"
      />

      {/* RIGHT → LEFT */}
      <Marquee
        items={bottomText}
        size="md:text-2xl"
        className="text-white md:text-2xl bg-[#C5B8FF] px-3 rounded-full"
        speed={20}
        direction="left"
      />
    </div>
  );
}

function Marquee({ items, size, speed, direction, className }: any) {
  // Move one full block width for seamless loop
  const distance = "118%";

  // If direction = right → reverse the animation
  const animateX =
    direction === "right"
      ? [`-${distance}`, "0%"]
      : ["0%", `-${distance}`];

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
        <Block items={items} size={size} className={className} />
        <Block items={items} size={size} className={className} />
        <Block items={items} size={size} className={className} />
      </motion.div>
    </div>
  );
}

function Block({ items, size, className }: any) {
  return (
    <div className="flex mx-4 md:mx-6 gap-8 md:gap-6">
      {items.map((item: string, i: number) => (
        <span
          key={i}
          className={`font-extrabold tracking-wider ${size} ${className || 'text-[#553D8F]'}`}
          style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900 }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

