import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ className, children, hover = false, variant = 'default', ...props }) => {
    const variants = {
        default: 'glass dark:glass-dark',
        flat: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
        ghost: 'bg-transparent border-none shadow-none',
    };

    const Component = hover ? motion.div : 'div';
    const animationProps = hover ? {
        whileHover: { y: -4, transition: { duration: 0.2 } }
    } : {};

    return (
        <Component
            className={twMerge(
                clsx(
                    'rounded-2xl p-6 transition-all duration-300',
                    variants[variant],
                    hover && 'hover:shadow-xl dark:hover:shadow-brand-900/20',
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
