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
            category: '',
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
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                    />
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-4 py-2 border rounded-xl flex items-center gap-2 font-medium transition-colors ${isOpen || hasActiveFilters
                            ? 'bg-violet-50 border-violet-200 text-violet-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    <Filter size={20} />
                    Filters
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-violet-600 rounded-full" />
                    )}
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {isOpen && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-1"
                        >
                            <X size={14} /> Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Date Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filters.start_date || ''}
                                    onChange={(e) => handleChange('start_date', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                                <input
                                    type="date"
                                    value={filters.end_date || ''}
                                    onChange={(e) => handleChange('end_date', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                            <select
                                value={filters.category || ''}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            >
                                <option value="">All Categories</option>
                                {Object.keys(categories).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            >
                                <option value="">All Types</option>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>

                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Amount Range</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.min_amount || ''}
                                    onChange={(e) => handleChange('min_amount', e.target.value)}
                                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.max_amount || ''}
                                    onChange={(e) => handleChange('max_amount', e.target.value)}
                                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
