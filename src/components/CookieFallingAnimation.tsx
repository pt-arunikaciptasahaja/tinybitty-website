import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import goldenCrunch from '@/assets/cookie-golden-crunch.png';
import heavenlyBites from '@/assets/cookie-heavenly-bites.png';
import harvestHaven from '@/assets/cookie-harvest-haven.png';
import desertCrown from '@/assets/cookie-desert-crown.png';

const cookieImages = [goldenCrunch, heavenlyBites, harvestHaven, desertCrown];

interface Cookie {
    id: number;
    left: number;
    duration: number;
    delay: number;
    size: number;
    rotation: number;
    imageIndex: number;
}

export default function CookieFallingAnimation() {
    const [cookies, setCookies] = useState<Cookie[]>([]);

    useEffect(() => {
        const generateCookies = () => {
            const newCookies: Cookie[] = [];
            const cookieCount = 20; // Increased density

            for (let i = 0; i < cookieCount; i++) {
                newCookies.push({
                    id: i,
                    left: Math.random() * 100,
                    duration: Math.random() * 5 + 8, // Slightly slower
                    delay: Math.random() * 10,
                    size: Math.random() * 30 + 25, // 25-55px
                    rotation: Math.random() * 360,
                    imageIndex: Math.floor(Math.random() * cookieImages.length),
                });
            }

            setCookies(newCookies);
        };

        generateCookies();
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatePresence>
                {cookies.map((cookie) => (
                    <motion.div
                        key={cookie.id}
                        initial={{ y: -100, rotate: 0, opacity: 0 }}
                        animate={{
                            y: ['0vh', '110vh'],
                            rotate: cookie.rotation + 360,
                            opacity: [0, 0.5, 0.5, 0], // Subtle 50% opacity
                        }}
                        transition={{
                            duration: cookie.duration,
                            repeat: Infinity,
                            delay: cookie.delay,
                            ease: "linear",
                        }}
                        style={{
                            position: 'absolute',
                            left: `${cookie.left}%`,
                            width: cookie.size,
                            height: cookie.size,
                        }}
                    >
                        <img
                            src={cookieImages[cookie.imageIndex]}
                            alt="Falling cookie"
                            className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
