import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useQueries';
import { useCreateExpense, useUpdateExpense } from '../hooks/useMutations';

import { useSettings } from '../context/SettingsContext';

export default function ExpenseForm({ initialData, onSuccess, onClose }) {
    const { settings } = useSettings();
    const { data: categories = [] } = useCategories();
    const createExpenseMutation = useCreateExpense();
    const updateExpenseMutation = useUpdateExpense();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
    });

    // Set default category when categories load
    useEffect(() => {
        if (!initialData && categories.length > 0 && !formData.category_id) {
            setTimeout(() => setFormData(prev => ({ ...prev, category_id: categories[0].id })), 0);
        }
    }, [categories, initialData]); // Removed formData.category_id to avoid loop

    useEffect(() => {
        if (initialData) {
            let categoryId = initialData.category?.id || initialData.category_id;

            // Handle Quick Add case where category is just a string name like "Other"
            if (!categoryId && typeof initialData.category === 'string' && categories.length > 0) {
                const foundCategory = categories.find(c =>
                    c.name.toLowerCase() === initialData.category.toLowerCase()
                );
                if (foundCategory) {
                    categoryId = foundCategory.id;
                }
            }

            setTimeout(() => setFormData(prev => ({
                ...prev,
                title: initialData.title,
                amount: initialData.amount,
                category_id: categoryId,
                date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
            })), 0);
        }
    }, [initialData, categories]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            title: formData.title,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date).toISOString(),
            category_id: parseInt(formData.category_id),
        };

        const mutationOptions = {
            onError: (error) => {
                console.error("Failed to save expense", error);
                // Since modal is closed, we might want to show a toast here in future
                alert("Failed to save expense");
            }
        };

        if (initialData?.id) {
            updateExpenseMutation.mutate({ id: initialData.id, data: payload }, mutationOptions);
        } else {
            createExpenseMutation.mutate(payload, mutationOptions);
        }

        // Instant close - reliance on Optimistic Updates
        if (onSuccess) onSuccess();
        if (onClose) onClose();
    };

    // Loading state derived from mutations
    const loading = createExpenseMutation.isPending || updateExpenseMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">What is this for?</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="e.g. Grocery Shopping"
                />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full pl-8 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <div className="relative">
                    <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none font-medium text-slate-900 dark:text-white"
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors active:scale-95"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-brand-500/30 font-bold transition-all active:scale-95 disabled:opacity-70 disabled:shadow-none"
                >
                    {loading ? 'Saving...' : (initialData?.id ? 'Update Expense' : 'Add Expense')}
                </button>
            </div>
        </form>
    );
}
