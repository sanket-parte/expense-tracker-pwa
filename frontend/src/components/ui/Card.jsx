import React, { useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ className, children, hover = false, interactive = false, variant = 'default', ...props }) => {
    const variants = {
        default: 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-glass dark:shadow-none hover:shadow-glass-md dark:hover:bg-slate-900/80',
        glass: 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-glass-sm',
        'glass-strong': 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass',
        flat: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',
        ghost: 'bg-transparent border-none shadow-none',
        gradient: 'bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-glass',
        outline: 'bg-transparent border border-slate-200 dark:border-slate-800',
    };

    const ref = useRef(null);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ref.current.style.setProperty('--x', `${x}px`);
        ref.current.style.setProperty('--y', `${y}px`);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={hover || interactive ? { y: -5, transition: { type: "spring", stiffness: 300 } } : {}}
            onMouseMove={handleMouseMove}
            className={twMerge(
                clsx(
                    'relative rounded-2xl overflow-hidden group p-6 transition-all duration-300', // Added p-6 and transition-all duration-300 from original
                    variants[variant],
                    interactive && 'cursor-pointer hover:ring-2 hover:ring-brand-500/20 active:scale-[0.98] transition-all',
                    className
                )
            )}
            {...props}
        >
            {/* Spotlight Effect Overlay */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(255,255,255,0.06), transparent 40%)`
                }}
            />
            {/* Spotlight Border Highlight */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(139, 92, 246, 0.3), transparent 40%)`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    padding: '1px'
                }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default Card;
