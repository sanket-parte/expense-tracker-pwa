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

    const handleDragEnd = async () => {
        if (y.get() > PULL_THRESHOLD) {
            medium();
            setIsRefreshing(true);
            await controls.start({ y: 60 }); // Stay visible while refreshing
            await onRefresh();
            setIsRefreshing(false);
            controls.start({ y: 0 }); // Return to top
        } else {
            controls.start({ y: 0 });
        }
    };

    return (
        <div className="relative z-0 h-full overflow-hidden" ref={containerRef}>
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }} // Only allow pulling down when at top
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ y }}
                className="relative z-10 h-full overflow-y-auto touch-pan-y"
            >
                {/* Loading Indicator - Positioned absolutely behind the content but revealed by drag */}
                <motion.div
                    style={{ opacity, rotate }}
                    className="absolute top-[-50px] left-0 right-0 flex justify-center items-center h-12"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-md">
                        <Loader2 className={`w-5 h-5 text-brand-600 dark:text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </div>
                </motion.div>

                {children}
            </motion.div>
        </div>
    );
}
