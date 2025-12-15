import React from 'react';
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

    const Component = (hover || interactive) ? motion.div : 'div';
    const animationProps = (hover || interactive) ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
        whileTap: { scale: 0.98 }
    } : {};

    return (
        <Component
            className={twMerge(
                clsx(
                    'rounded-2xl p-6 transition-all duration-300',
                    variants[variant],
                    (hover || interactive) && 'cursor-pointer',
                    className
                )
            )}
            {...animationProps}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Card;
