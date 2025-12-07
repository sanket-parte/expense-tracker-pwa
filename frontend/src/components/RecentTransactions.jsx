import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used
import { ArrowRight, ShoppingBag, Coffee, Home, Zap, Car, Film } from 'lucide-react';
import { useRecentExpenses } from '../hooks/useQueries';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
    'Shopping': ShoppingBag,
    'Food': Coffee,
    'Housing': Home,
    'Utilities': Zap,
    'Transport': Car,
    'Entertainment': Film,
    // Add more mappings or a default
};

export default function RecentTransactions() {
    const { data: expenses, isLoading, error } = useRecentExpenses();

    if (isLoading) return <div className="p-6 text-center text-slate-400">Loading activity...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Failed to load activity</div>;
    if (!expenses || expenses.length === 0) return <div className="p-6 text-center text-slate-400">No recent activity</div>;

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-glass flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
                <Link to="/expenses" className="text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 transition-colors">
                    View All <ArrowRight size={16} />
                </Link>
            </div>

            <div className="space-y-4">
                {expenses.map((expense) => {
                    const Icon = CATEGORY_ICONS[expense.category?.name] || ShoppingBag; // Fallback icon
                    return (
                        <div key={expense.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300">
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{expense.title || expense.category?.name}</p>
                                    <p className="text-xs text-slate-400 font-medium pt-0.5">{format(new Date(expense.date), 'MMM d, h:mm a')}</p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white font-mono">-₹{Math.abs(expense.amount).toLocaleString()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
