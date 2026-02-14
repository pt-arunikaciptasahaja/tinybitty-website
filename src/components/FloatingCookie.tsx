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
}

const FloatingCookie = ({
    src,
    name,
    size,
    orbitRadius,
    orbitSpeed,
    startAngle, // Expecting radians, will convert to degrees for rotation
    floatDelay,
    mouseX,
    mouseY,
    isPaused,
    onHoverChange,
}: FloatingCookieProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const parallaxX = (mouseX - 0.5) * 30;
    const parallaxY = (mouseY - 0.5) * 30;

    // Convert startAngle (radians) to degrees for rotation transform
    const startDegrees = (startAngle * 180) / Math.PI;

    return (
        <motion.div
            className="absolute flex items-center justify-center"
            style={{
                x: parallaxX,
                y: parallaxY,
                width: orbitRadius * 2,
                height: orbitRadius * 2,
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
                    delay: -floatDelay, // Negative delay to start at correct position immediately if needed, or use positive if intended
                }}
                style={{ pointerEvents: "none" }} // Pass clicks through the large orbit container
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
                        pointerEvents: "auto", // Re-enable clicks on the cookie itself
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
                        {/* Hover Scale & Glow Effect */}
                        <motion.div
                            animate={{ scale: isHovered ? 1.1 : 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-full h-full relative"
                        >
                            <div
                                className={`relative w-full h-full ${isHovered ? "cookie-glow" : ""
                                    } transition-all duration-300`}
                            >
                                <motion.div
                                    animate={isPaused ? {} : { rotate: 360 }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="w-full h-full"
                                >
                                    <img
                                        src={src}
                                        alt={name}
                                        className="w-full h-full object-contain drop-shadow-2xl"
                                        draggable={false}
                                    />
                                </motion.div>
                            </div>

                            {/* Label */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{
                                    width: size + 100,
                                    height: size + 100,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.svg
                                    width="100%"
                                    height="100%"
                                    viewBox={`0 0 ${size + 100} ${size + 100}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <defs>
                                        <path
                                            id={`circlePath-${name.replace(/\s+/g, "-")}`}
                                            d={`
                                                M ${(size + 100) / 2 - (size / 2 + 30)}, ${(size + 100) / 2}
                                                a ${size / 2 + 30},${size / 2 + 30} 0 0,0 ${size + 60},0
                                            `}
                                        />
                                    </defs>
                                    <text className="text-[15px] font-bold tracking-[0.2em] uppercase fill-muted-foreground">
                                        <textPath
                                            href={`#circlePath-${name.replace(/\s+/g, "-")}`}
                                            startOffset="50%"
                                            textAnchor="middle"
                                        >
                                            {name}
                                        </textPath>
                                    </text>
                                </motion.svg>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FloatingCookie;
