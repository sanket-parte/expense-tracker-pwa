import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

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
        <div className="space-y-4 mb-6">
            <div className="flex gap-3">
                {/* Search Bar */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-4 py-2 border rounded-xl flex items-center gap-2 font-medium transition-all active:scale-95 ${isOpen || hasActiveFilters
                        ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20 text-brand-700 dark:text-brand-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                >
                    <Filter size={20} />
                    Filters
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-brand-600 rounded-full" />
                    )}
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {/* Advanced Filters Panel */}
            {isOpen && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Advanced Filters</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm font-medium text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                            <X size={14} /> Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Date Range Group */}
                        <div className="md:col-span-2 lg:col-span-2 space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="date"
                                    value={filters.start_date || ''}
                                    onChange={(e) => handleChange('start_date', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 dark:text-white"
                                />
                                <span className="text-slate-300 font-medium">to</span>
                                <input
                                    type="date"
                                    value={filters.end_date || ''}
                                    onChange={(e) => handleChange('end_date', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                            <div className="relative">
                                <select
                                    value={filters.category_id || ''}
                                    onChange={(e) => handleChange('category_id', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none font-medium text-slate-700 dark:text-white"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 3.5L5 6L7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Range</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.min_amount || ''}
                                    onChange={(e) => handleChange('min_amount', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 dark:text-white"
                                />
                                <span className="text-slate-300">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.max_amount || ''}
                                    onChange={(e) => handleChange('max_amount', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
