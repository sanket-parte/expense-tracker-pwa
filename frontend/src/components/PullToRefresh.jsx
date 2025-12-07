import React, { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import useHaptics from '../hooks/useHaptics';

const PULL_THRESHOLD = 100;

export default function PullToRefresh({ onRefresh, children }) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef(null);
    const y = useMotionValue(0);
    const controls = useAnimation();
    const { medium } = useHaptics();

    // eslint-disable-next-line no-unused-vars
    const progress = useTransform(y, [0, PULL_THRESHOLD], [0, 100]);
    const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 360]);
    const opacity = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0, 0.5, 1]);

    const handleTouchStart = (e) => {
        if (containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
        } else {
            startY.current = null;
        }
    };

    const handleTouchMove = (e) => {
        if (!startY.current) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && containerRef.current.scrollTop === 0) {
            // Pulling down at top
            e.preventDefault(); // Prevent browser refresh/scroll
            // Add resistance
            const damped = diff * 0.4; // simpler damping
            y.set(damped);
        }
        // Else: scrolling up or not at top - let native scroll happen
    };

    const handleTouchEnd = async () => {
        if (!startY.current) return;
        startY.current = null;

        if (y.get() > PULL_THRESHOLD) {
            medium();
            setIsRefreshing(true);
            await controls.start({ y: 60 });
            await onRefresh();
            setIsRefreshing(false);
            controls.start({ y: 0 });
        } else {
            controls.start({ y: 0 });
        }
    };

    const startY = useRef(null);

    return (
        <div className="relative z-0 h-full overflow-hidden">
            {/* Loading Indicator */}
            <motion.div
                style={{ opacity, rotate, y }}
                className="absolute top-4 left-0 right-0 flex justify-center items-center z-0"
            >
                <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-slate-100 dark:border-slate-700">
                    <Loader2 className={`w-5 h-5 text-brand-600 dark:text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
            </motion.div>

            <motion.div
                animate={controls}
                style={{ y }}
                className="relative z-10 h-full overflow-y-auto touch-pan-y no-scrollbar"
                ref={containerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </motion.div>
        </div>
    );
}
