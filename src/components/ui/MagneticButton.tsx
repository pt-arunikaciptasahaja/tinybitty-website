import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, useRef } from "react";

interface MagneticButtonProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

const MagneticButton = ({
    children,
    variant = "primary",
    className = "",
    onClick,
    disabled = false,
}: MagneticButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null);

    // Mouse position values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring physics for smooth magnetic effect
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    // Transform template for the button
    const transform = useMotionTemplate`translate(${xSpring}px, ${ySpring}px)`;

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!ref.current || disabled) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const relativeX = clientX - (left + width / 2);
        const relativeY = clientY - (top + height / 2);

        // Magnetic strength
        const strength = 0.4;
        x.set(relativeX * strength);
        y.set(relativeY * strength);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const baseStyles =
        "relative rounded-full px-8 py-3.5 text-sm font-bold tracking-wide uppercase transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
        primary: "bg-foreground text-primary-foreground hover:text-accent-foreground",
        secondary:
            "border border-foreground/20 text-foreground hover:border-foreground/50",
    };

    return (
        <motion.button
            ref={ref}
            style={{ transform }}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            disabled={disabled}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
        >
            <span className="relative z-10 block pointer-events-none">
                {children}
            </span>

            {/* Fill Effect for Primary Button */}
            {variant === "primary" && (
                <span className="absolute inset-0 z-0 bg-accent scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 origin-center" />
            )}

            {/* Fill Effect for Secondary Button - subtler bloom */}
            {variant === "secondary" && (
                <span className="absolute inset-0 z-0 bg-foreground/5 scale-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-100" />
            )}
        </motion.button>
    );
};

export default MagneticButton;
