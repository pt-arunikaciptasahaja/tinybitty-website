import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FloatingCookie from "./FloatingCookie";
import MagneticButton from "./ui/MagneticButton";
import goldenCrunch from "@/assets/cookie-golden-crunch.png";
import heavenlyBites from "@/assets/cookie-heavenly-bites.png";
import harvestHaven from "@/assets/cookie-harvest-haven.png";
import desertCrown from "@/assets/cookie-desert-crown.png";

const cookiesData = [
  {
    src: goldenCrunch,
    name: "Golden Crunch",
    size: 140,
    orbitRadius: 130,
    orbitSpeed: 40,
    startAngle: 0,
    floatDelay: 0,
  },
  {
    src: heavenlyBites,
    name: "Heavenly Bites",
    size: 140,
    orbitRadius: 130,
    orbitSpeed: 40,
    startAngle: (Math.PI * 2) / 3, // 120 degrees
    floatDelay: 0,
  },
  {
    src: harvestHaven,
    name: "Harvest Haven",
    size: 140,
    orbitRadius: 130,
    orbitSpeed: 40,
    startAngle: (Math.PI * 4) / 3, // 240 degrees
    floatDelay: 0,
  },
];

const HeroSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative min-h-[auto] md:min-h-screen flex items-center overflow-hidden noise-bg mb-8 md:mb-10 mt-20 md:mt-[104px] border border-secondary/20 rounded-3xl"
    >
      {/* Subtle radial gradient - Shifted to left for text focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              90deg,
              hsl(var(--muted) / 0.2) 0px, hsl(var(--muted) / 0.2) 20px, transparent 20px, transparent 40px,
              hsl(var(--muted) / 0.2) 40px, hsl(var(--muted) / 0.2) 60px, transparent 60px, transparent 80px,
              hsl(var(--muted) / 0.2) 80px, hsl(var(--muted) / 0.2) 100px, transparent 100px, transparent 120px,
              hsl(var(--muted) / 0.2) 120px, hsl(var(--muted) / 0.2) 140px, transparent 140px, transparent 160px,
              hsl(var(--accent) / 0.2) 160px, hsl(var(--accent) / 0.2) 180px, transparent 180px, transparent 200px,
              hsl(var(--accent) / 0.2) 200px, hsl(var(--accent) / 0.2) 220px, transparent 220px, transparent 240px,
              hsl(var(--accent) / 0.2) 240px, hsl(var(--accent) / 0.2) 260px, transparent 260px, transparent 280px,
              hsl(var(--accent) / 0.2) 280px, hsl(var(--accent) / 0.2) 300px, transparent 300px, transparent 320px
            )
          `,
          backgroundSize: "320px 100%",
          WebkitMaskImage: isMobile
            ? "radial-gradient(circle at 50% 35%, transparent 0%, black 85%)"
            : "radial-gradient(circle at 20% 50%, transparent 0%, black 70%)",
          maskImage: isMobile
            ? "radial-gradient(circle at 50% 35%, transparent 0%, black 85%)"
            : "radial-gradient(circle at 20% 50%, transparent 0%, black 70%)",
        }}
      />

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-4 md:gap-12 items-center relative z-10 w-full h-full pt-10 pb-12 md:py-0">
        {/* Left: Typography */}
        <div className="text-left max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm md:text-lg font-laila font-bold tracking-[0.1em] text-accent mb-2 md:mb-4"
          >
            Artisan Baked · Small Batch
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-4xl md:text-8xl font-montserrat-heading tracking-tight leading-[0.95] text-foreground mb-3 md:mb-6"
          >
            Tiny Bites.
            <br />
            <span className="text-accent">
              Big{" "}
              <motion.span
                className="relative inline-block cursor-default"
                whileHover="hover"
              >
                Cravings.
                <motion.div
                  className="absolute -bottom-1 left-0 h-1 md:h-2 bg-secondary/40 rounded-full"
                  initial={{ width: 0 }}
                  variants={{
                    hover: { width: "100%" }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xs md:text-lg text-muted-foreground mb-6 md:mb-10 font-medium leading-relaxed max-w-md"
          >
            Handcrafted cookies made with the finest ingredients.
            Every bite tells a story of passion and craft.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex items-center justify-start gap-3 md:gap-4 mb-4 md:mb-0"
          >
            <MagneticButton
              variant="primary"
              className="text-white text-xs md:text-sm px-6 py-2.5 md:px-8 md:py-3.5"
              onClick={scrollToProducts}
            >
              Shop Now
            </MagneticButton>
            <MagneticButton
              variant="secondary"
              className="text-xs md:text-sm px-6 py-2.5 md:px-8 md:py-3.5"
              onClick={() => navigate('/our-story')}
            >
              Our Story
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right: Floating Cookies Animation */}
        <div className="relative h-[250px] md:h-[300px] w-full flex items-center justify-center">
          {/* Animation Container */}
          <div className="relative w-full h-full max-w-[300px] md:max-w-[400px] max-h-[300px] md:max-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center">
              {cookiesData.map((cookie, index) => (
                <FloatingCookie
                  key={cookie.name}
                  {...cookie}
                  size={isMobile ? cookie.size * 0.75 : cookie.size}
                  orbitRadius={isMobile ? cookie.orbitRadius * 0.70 : cookie.orbitRadius}
                  mouseX={0.5}
                  mouseY={0.5}
                  isPaused={isPaused}
                  onHoverChange={setIsPaused}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;