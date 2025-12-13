import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Input = React.forwardRef(({ className, type, icon, error, label, ...props }, ref) => {
    return (
        <div className="w-full relative group">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    className={twMerge(
                        clsx(
                            "flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50 dark:ring-offset-slate-950 dark:placeholder:text-slate-500 transition-all duration-200",
                            icon && "pl-11",
                            error && "border-red-500 focus-visible:ring-red-500",
                            className
                        )
                    )}
                    ref={ref}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors duration-200">
                        {React.isValidElement(icon) ? icon : React.createElement(icon, { size: 20 })}
                    </div>
                )}
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-1 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
