import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const steps = [
    {
        target: 'welcome-step', // Virtual step, no highlight
        title: "Welcome to Flow",
        content: "Let's take a quick tour to help you get the most out of your new smart expense tracker.",
        position: 'center'
    },
    {
        target: 'magic-input',
        title: "Magic Input",
        content: "Just type like you talk. Try 'Coffee 200 yesterday' or 'Uber 450'. AI handles the rest.",
        position: 'bottom'
    },
    {
        target: 'stats-overview',
        title: "Instant Insights",
        content: "Track your total expenses, budgets, and savings in real-time right here.",
        position: 'bottom'
    },
    {
        target: 'voice-input',
        title: "Voice Commands",
        content: "On the go? Just tap the mic and say your expense. We'll categorize it automatically.",
        position: 'top'
    }
];

export default function OnboardingTour({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(() => {
        return !localStorage.getItem('hasSeenOnboarding');
    });

    useEffect(() => {
        // If it was already visible (true from lazy init), we don't need to do anything.
        // If it shouldn't be visible, calling onComplete if provided might be needed, 
        // but typically onComplete is for when the *active* tour finishes.
        if (!isVisible && !localStorage.getItem('hasSeenOnboarding')) {
            // Edge case if state didn't sync, but lazy init handles it.
        }
    }, [isVisible, onComplete]);

    // Effect for step logic if needed, currently we just render based on state.
    // Removed unused style calculation for V1 to satisfy linter and simplify.

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishTour();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const finishTour = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <div className="absolute inset-0" onClick={finishTour} /> {/* Click outside to dismiss? Maybe not for onboarding */}

                <motion.div
                    key={currentStep}
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -10 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-[101] border border-white/20 ring-1 ring-black/5"
                >
                    <button
                        onClick={finishTour}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-6">
                        <span className="text-xs font-bold tracking-wider text-brand-600 dark:text-brand-400 uppercase">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-3">
                            {step.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step.content}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-1.5 mb-8">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    idx === currentStep ? "w-8 bg-brand-600" : "w-1.5 bg-slate-200 dark:bg-slate-700"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={cn(
                                "text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-4 py-2",
                                currentStep === 0 && "opacity-0 pointer-events-none"
                            )}
                        >
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-500/30 active:scale-95"
                        >
                            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                            {currentStep === steps.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
