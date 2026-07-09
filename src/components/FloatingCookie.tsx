import { motion } from "framer-motion";
import { useState } from "react";

interface FloatingCookieProps {
    src: string;
    name: string;
    size: number;
    orbitRadius: number;
    orbitSpeed: number;
    startAngle: number;
    floatDelay: number;
    mouseX: number;
    mouseY: number;
    isPaused: boolean;
    onHoverChange: (hovered: boolean) => void;
    index?: number;
}

const FloatingCookie = ({
    src,
    name,
    size,
    orbitRadius,
    orbitSpeed,
    startAngle,
    floatDelay,
    mouseX,
    mouseY,
    isPaused,
    onHoverChange,
    index = 0,
}: FloatingCookieProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const parallaxX = (mouseX - 0.5) * 20;
    const parallaxY = (mouseY - 0.5) * 20;

    // Convert startAngle (radians) to degrees for rotation transform
    const startDegrees = (startAngle * 180) / Math.PI;

    // Stagger delay for entrance animation
    const staggerDelay = index * 0.15;

    return (
        <motion.div
            className="absolute flex items-center justify-center"
            style={{
                x: parallaxX,
                y: parallaxY,
                width: orbitRadius * 2,
                height: orbitRadius * 2,
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                delay: staggerDelay + 0.5,
                duration: 0.8,
                type: "spring",
                stiffness: 120,
                damping: 14,
            }}
        >
            {/* Orbit Container - Rotates around the center */}
            <motion.div
                className="absolute inset-0"
                initial={{ rotate: startDegrees }}
                animate={isPaused ? {} : { rotate: startDegrees + 360 }}
                transition={{
                    duration: orbitSpeed,
                    repeat: Infinity,
                    ease: "linear",
                    delay: -floatDelay,
                }}
                style={{ pointerEvents: "none" }}
            >
                {/* Positioner - Pushes the cookie out to the radius */}
                <div
                    className="absolute top-1/2 left-1/2"
                    style={{
                        width: size,
                        height: size,
                        marginLeft: -size / 2,
                        marginTop: -size / 2,
                        transform: `translateX(${orbitRadius}px)`,
                        pointerEvents: "auto",
                    }}
                >
                    {/* Counter-Rotation Container - Keeps cookie upright */}
                    <motion.div
                        className="w-full h-full cursor-pointer relative"
                        initial={{ rotate: -startDegrees }}
                        animate={isPaused ? {} : { rotate: -startDegrees - 360 }}
                        transition={{
                            duration: orbitSpeed,
                            repeat: Infinity,
                            ease: "linear",
                            delay: -floatDelay,
                        }}
                        onMouseEnter={() => {
                            setIsHovered(true);
                            onHoverChange(true);
                        }}
                        onMouseLeave={() => {
                            setIsHovered(false);
                            onHoverChange(false);
                        }}
                    >
                        {/* Hover Scale & Float Effect */}
                        <motion.div
                            animate={{
                                scale: isHovered ? 1.18 : 1,
                                y: isHovered ? -8 : 0,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                            }}
                            className="w-full h-full relative"
                        >
                            {/* Subtle glow ring on hover */}
                            <motion.div
                                className="absolute inset-[-8px] rounded-full"
                                animate={{
                                    opacity: isHovered ? 0.4 : 0,
                                    scale: isHovered ? 1.05 : 0.9,
                                }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                style={{
                                    background: "radial-gradient(circle, hsl(var(--accent) / 0.3) 0%, transparent 70%)",
                                    filter: "blur(12px)",
                                }}
                            />

                            <div
                                className="relative w-full h-full transition-all duration-300"
                                style={{
                                    filter: isHovered
                                        ? "drop-shadow(0 8px 24px hsl(var(--accent) / 0.35))"
                                        : "drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
                                }}
                            >
                                {/* Rounded frosted-glass background */}
                                <motion.div
                                    className="absolute inset-[-5%] rounded-full"
                                    animate={{
                                        scale: isHovered ? 1.05 : 1,
                                    }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    style={{
                                        background: isHovered
                                            ? "radial-gradient(circle, hsl(var(--accent) / 0.12) 0%, hsl(var(--background) / 0.7) 80%)"
                                            : "radial-gradient(circle, hsl(var(--background) / 0.6) 0%, hsl(var(--muted) / 0.35) 80%)",
                                        backdropFilter: "blur(8px)",
                                        WebkitBackdropFilter: "blur(8px)",
                                        border: isHovered
                                            ? "1.5px solid hsl(var(--accent) / 0.25)"
                                            : "1px solid hsl(var(--border) / 0.3)",
                                        boxShadow: isHovered
                                            ? "inset 0 1px 12px hsl(var(--accent) / 0.1), 0 2px 16px hsl(var(--accent) / 0.08)"
                                            : "inset 0 1px 8px hsl(var(--background) / 0.3), 0 1px 6px rgba(0,0,0,0.04)",
                                        transition: "background 0.35s ease, border 0.35s ease, box-shadow 0.35s ease",
                                    }}
                                />

                                {/* Gentle self-rotation */}
                                <motion.div
                                    animate={isPaused ? {} : { rotate: 360 }}
                                    transition={{
                                        duration: 25,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="w-full h-full relative z-10"
                                >
                                    <img
                                        src={src}
                                        alt={name}
                                        className="w-full h-full object-contain"
                                        draggable={false}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </motion.div>
                            </div>

                            {/* Curved Text Label */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{
                                    width: size + 60,
                                    height: size + 60,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isHovered ? 1 : 0.6 }}
                                transition={{ duration: 0.4 }}
                            >
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox={`0 0 ${size + 60} ${size + 60}`}
                                >
                                    <defs>
                                        <path
                                            id={`circlePath-${name.replace(/\s+/g, "-")}`}
                                            d={`
                                                M ${(size + 60) / 2 - (size / 2 + 15)}, ${(size + 60) / 2}
                                                a ${size / 2 + 15},${size / 2 + 15} 0 0,0 ${size + 30},0
                                            `}
                                        />
                                    </defs>
                                    <text
                                        className="fill-muted-foreground"
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            letterSpacing: "0.18em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        <textPath
                                            href={`#circlePath-${name.replace(/\s+/g, "-")}`}
                                            startOffset="50%"
                                            textAnchor="middle"
                                        >
                                            {name}
                                        </textPath>
                                    </text>
                                </svg>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FloatingCookie;
