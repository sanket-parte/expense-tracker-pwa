import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children }) {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            // Small delay to allow mounting before animating in
            setTimeout(() => setVisible(true), 10);
            document.body.style.overflow = 'hidden';
        } else {
            setVisible(false);
            const timer = setTimeout(() => setMounted(false), 300); // Wait for anim
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!mounted && !isOpen) return null;

    return createPortal(
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center sm:p-4 transition-all duration-300",
            visible ? "visible" : "invisible"
        )}>
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
                    visible ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Modal Content - Bottom Sheet on Mobile, Center Modal on Desktop */}
            <div className={cn(
                "bg-white w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                "fixed bottom-0 sm:relative sm:bottom-auto rounded-t-[32px] sm:rounded-3xl",
                "transition-all duration-300 ease-out transform",
                visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-full sm:translate-y-8 opacity-0 sm:scale-95"
            )}>
                {/* Drag Handle for Mobile */}
                <div className="mx-auto w-12 h-1.5 bg-slate-200 rounded-full mt-3 mb-1 sm:hidden shrink-0" />

                <div className="flex justify-between items-center p-6 border-b border-slate-50 shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.getElementById('root') || document.body
    );
}
