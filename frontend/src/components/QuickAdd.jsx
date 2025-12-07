import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';
import api from '../lib/api';

export default function QuickAdd({ onQuickAdd }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white mb-6">
            <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-yellow-300" />
                <h3 className="font-bold text-lg">Quick Add</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-4">
                Type naturally, e.g., "Lunch 150", "Taxi 500rs"
            </p>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. Chips 20rs"
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur-sm"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-violet-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
