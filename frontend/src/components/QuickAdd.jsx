import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';

import { cn } from '../lib/utils';

export default function QuickAdd({ onQuickAdd }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const parseInput = (text) => {
        // Regex to find amount: looks for number optionally followed by 'rs', 'inr', '$'
        // Matches 50, 50.5, 50rs, rs50, $50
        const amountRegex = /(\d+(\.\d+)?)\s*(rs|inr|\$)|(rs|inr|\$)\s*(\d+(\.\d+)?)|(\d+(\.\d+)?)/i;
        const match = text.match(amountRegex);

        if (match) {
            // Extract number from the match
            const numberStr = match[1] || match[5] || match[7];
            const amount = parseFloat(numberStr);

            // Remove the matched amount part from the text to get the title
            let title = text.replace(match[0], '').trim();

            // Cleanup title
            title = title.replace(/\s+/g, ' ').trim();
            if (!title) title = "Quick Expense";

            return { title, amount };
        }

        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const parsed = parseInput(input);
        if (!parsed) {
            alert("Could not parse amount. Please enter like 'Coffee 50'");
            return;
        }

        // Pass parsed data to parent instead of saving directly
        onQuickAdd({
            title: parsed.title,
            amount: parsed.amount,
            category: 'Other', // Default
            date: new Date().toISOString()
        });
        setInput('');
    };

    return (
        <div className="relative mb-8 group z-20">
            <div className={cn(
                "absolute -inset-0.5 bg-gradient-to-r from-brand-500 via-violet-500 to-indigo-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-700",
                isFocused ? "opacity-80 blur-md" : ""
            )}></div>
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-2 shadow-glass border border-white/60 dark:border-white/10">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <div className="pl-4 pr-2 text-brand-600 dark:text-brand-400">
                        <Zap size={24} fill="currentColor" className={cn("transition-all duration-300", isFocused ? "scale-110 drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]" : "opacity-70")} />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Quick add: 'Lunch 150'..."
                        className="flex-1 py-4 text-lg bg-transparent border-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100 font-medium caret-brand-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3.5 bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-brand-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        <Send size={20} strokeWidth={2.5} />
                    </button>
                </form>
            </div>
            {isFocused && (
                <p className="absolute left-6 -bottom-8 text-xs text-slate-500 dark:text-slate-400 font-medium animate-in fade-in slide-in-from-top-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/40 dark:border-slate-700">
                    Try: <span className="text-brand-700 dark:text-brand-400 font-bold">"Coffee 50"</span> or <span className="text-brand-700 dark:text-brand-400 font-bold">"Taxi 200rs"</span>
                </p>
            )}
        </div>
    );
}

