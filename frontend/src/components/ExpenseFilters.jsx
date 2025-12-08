import React, { useState } from 'react';
import { Search, Filter, X, Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import Input from './ui/Input';
import { cn } from '../lib/utils';

export default function ExpenseFilters({ filters, onChange, categories }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onChange({
            search: '',
            category_id: '',
            type: '',
            start_date: '',
            end_date: '',
            min_amount: '',
            max_amount: ''
        });
        setIsOpen(false);
    };

    const hasActiveFilters = Object.entries(filters).some(([key, val]) =>
        key !== 'search' && val !== ''
    );

    return (
        <div className="space-y-4 mb-6 relative z-30">
            <div className="flex gap-3">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-sm hover:shadow-md transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>

                {/* Filter Toggle Button */}
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    variant={isOpen || hasActiveFilters ? "secondary" : "outline"}
                    className={cn(
                        "rounded-2xl border-white/40 dark:border-slate-700/50 min-w-[50px] px-0 md:px-5 flex items-center justify-center gap-2",
                        (isOpen || hasActiveFilters) && "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/30"
                    )}
                >
                    <Filter size={20} />
                    <span className="hidden md:inline">Filters</span>
                    {hasActiveFilters && (
                        <span className="hidden md:block w-1.5 h-1.5 bg-brand-500 rounded-full" />
                    )}
                </Button>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-slate-700/50 shadow-glass mt-2">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Filter size={16} className="text-brand-500" />
                                    Advanced Filters
                                </h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 bg-slate-100 dark:bg-slate-800"
                                >
                                    <X size={12} /> Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {/* Date Range Group */}
                                <div className="md:col-span-2 lg:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date Range</label>
                                    <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-1.5 border border-slate-200 dark:border-slate-700 rounded-2xl">
                                        <div className="relative flex-1">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={filters.start_date || ''}
                                                onChange={(e) => handleChange('start_date', e.target.value)}
                                                className="w-full pl-9 pr-2 py-2.5 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                            />
                                        </div>
                                        <span className="text-slate-300 dark:text-slate-600 font-medium px-1">to</span>
                                        <div className="relative flex-1">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={filters.end_date || ''}
                                                onChange={(e) => handleChange('end_date', e.target.value)}
                                                className="w-full pl-9 pr-2 py-2.5 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                                    <div className="relative">
                                        <select
                                            value={filters.category_id || ''}
                                            onChange={(e) => handleChange('category_id', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 bg-transparent">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount Range</label>
                                    <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-1.5 border border-slate-200 dark:border-slate-700 rounded-2xl">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_amount || ''}
                                            onChange={(e) => handleChange('min_amount', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-center"
                                        />
                                        <span className="text-slate-300 dark:text-slate-600">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_amount || ''}
                                            onChange={(e) => handleChange('max_amount', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
