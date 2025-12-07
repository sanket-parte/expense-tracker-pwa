import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Edit2 } from 'lucide-react';
import useHaptics from '../hooks/useHaptics';

export default function SwipeableItem({ children, onDelete, onEdit, id }) {
    const x = useMotionValue(0);
    const controls = useAnimation();
    const { light } = useHaptics();

    // Background color transformation
    const background = useTransform(
        x,
        [-100, -50, 0, 50, 100],
        ['rgba(239, 68, 68, 1)', 'rgba(239, 68, 68, 0.5)', 'transparent', 'rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 1)']
    );

    const handleDragEnd = async () => {
        const currentX = x.get();
        if (currentX < -100 && onDelete) {
            light();
            onDelete(id);
            // Reset position after action (or let the item be removed from DOM)
            controls.start({ x: 0 });
        } else if (currentX > 100 && onEdit) {
            light();
            onEdit(id);
            controls.start({ x: 0 });
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl mb-3">
            <motion.div
                className="absolute inset-0 flex justify-between items-center px-6 z-0"
                style={{ background }}
            >
                <div className="flex items-center text-white font-bold opacity-0" style={{ opacity: x.get() > 50 ? 1 : 0 }}>
                    <Edit2 size={20} />
                </div>
                <div className="flex items-center text-white font-bold opacity-0" style={{ opacity: x.get() < -50 ? 1 : 0 }}>
                    <Trash2 size={20} />
                </div>
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className="relative z-10 bg-white dark:bg-slate-900"
            >
                {children}
            </motion.div>
        </div>
    );
}
