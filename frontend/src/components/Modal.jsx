import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { createPortal } from 'react-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import useHaptics from '../hooks/useHaptics';

export default function Modal({ isOpen, onClose, title, children }) {
    const [mounted, setMounted] = useState(false);
    const { light } = useHaptics();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            light();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, light]);

    if (!mounted) return null;

    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

    const desktopVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    const mobileVariants = {
        hidden: { y: '100%' },
        visible: { y: 0 }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        variants={isMobile ? mobileVariants : desktopVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        drag={isMobile ? "y" : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            // Close if dragged down sufficiently
                            if (offset.y > 100 || velocity.y > 500) {
                                onClose();
                            }
                        }}
                        className={cn(
                            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                            "rounded-t-[32px] sm:rounded-3xl relative z-10 border border-white/20 dark:border-slate-700/50"
                        )}
                    >
                        {/* Drag Handle for Mobile */}
                        <div className="mx-auto w-12 h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full mt-3 mb-1 sm:hidden shrink-0 touch-none" />

                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        {/* Content Area - Ensure it doesn't intercept drag gestures for the sheet too aggressively if scrolling, but we used drag listener on parent */}
                        <div className="p-6 overflow-y-auto overscroll-contain">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.getElementById('root') || document.body
    );
}
