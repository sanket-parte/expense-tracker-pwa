import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function MagicExpenseInput({ onParse }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        setLoading(true);
        try {
            const { data } = await api.post('/ai/parse', { text: input });
            if (data.parsed) {
                onParse(data.parsed);
                setInput('');
            }
        } catch (error) {
            console.error("AI Parsing failed:", error);
            // Fallback or error toast could go here
            alert("Failed to understand expense. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group z-20">
            {/* Ambient Glow */}
            <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000",
                isFocused ? "opacity-75 blur-xl duration-500" : ""
            )}></div>

            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[1.75rem] p-2 shadow-2xl ring-1 ring-white/50 dark:ring-white/10 transition-all duration-300">
                <form onSubmit={handleSubmit} className="flex items-center gap-3 pl-4 pr-2">
                    <div className={cn(
                        "text-indigo-600 dark:text-indigo-400 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-all duration-500",
                        isFocused ? "scale-110 rotate-12 bg-indigo-100 dark:bg-indigo-900/40" : ""
                    )}>
                        {loading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <Sparkles size={24} fill="currentColor" className={cn(isFocused ? "animate-pulse" : "")} />
                        )}
                    </div>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={loading ? "Analyzing..." : "Ask AI: 'Uber 450 yesterday'"}
                        disabled={loading}
                        className="flex-1 py-4 text-lg bg-transparent border-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100 font-medium caret-indigo-500 disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className={cn(
                            "p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center",
                            input.trim()
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                        )}
                    >
                        <Send size={20} strokeWidth={2.5} className={cn(loading ? "opacity-0" : "opacity-100")} />
                    </button>
                </form>
            </div>

            {/* Helper Text */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-6 -bottom-10 flex gap-2"
                    >
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 dark:border-slate-700 shadow-sm">
                            Try: <span className="text-indigo-600 dark:text-indigo-400 font-bold">"Starbucks 350"</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 dark:border-slate-700 shadow-sm">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">"Grocery 2k last friday"</span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
