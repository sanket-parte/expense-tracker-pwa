import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Coffee, Home, Zap, Car, Film, Clock } from 'lucide-react';
import { useRecentExpenses } from '../hooks/useQueries';
import { format } from 'date-fns';
import Card from './ui/Card';

const CATEGORY_ICONS = {
    'Shopping': ShoppingBag,
    'Food': Coffee,
    'Housing': Home,
    'Utilities': Zap,
    'Transport': Car,
    'Entertainment': Film,
};

export default function RecentTransactions() {
    const { data: expenses, isLoading, error } = useRecentExpenses();

    if (isLoading) return <Card className="p-6 text-center text-slate-400 h-full flex items-center justify-center">Loading activity...</Card>;
    if (error) return <Card className="p-6 text-center text-red-500 h-full flex items-center justify-center">Failed to load activity</Card>;
    if (!expenses || expenses.length === 0) return <Card className="p-6 text-center text-slate-400 h-full flex items-center justify-center flex-col gap-2"><Clock size={32} className="opacity-20" />No recent activity</Card>;

    return (
        <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
                    </div>
                </div>
                <Link to="/expenses" className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
                    View All <ArrowRight size={14} />
                </Link>
            </div>

            <div className="space-y-3 flex-1 overflow-auto pr-1 custom-scrollbar">
                {expenses.map((expense) => {
                    const Icon = CATEGORY_ICONS[expense.category?.name] || ShoppingBag;
                    return (
                        <div key={expense.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-3 -mx-2 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:bg-brand-100 group-hover:text-brand-600 dark:group-hover:bg-brand-900/20 dark:group-hover:text-brand-400 transition-all duration-300 shadow-sm">
                                    <Icon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {expense.title || expense.category?.name}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {format(new Date(expense.date), 'MMM d, h:mm a')}
                                    </p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                                -₹{Math.abs(expense.amount).toLocaleString()}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

