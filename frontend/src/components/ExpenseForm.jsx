import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useCategories } from '../hooks/useQueries';
import { useCreateExpense, useUpdateExpense } from '../hooks/useMutations';
import { useSettings } from '../context/SettingsContext';
import Input from './ui/Input';
import Button from './ui/Button';
import { ChevronDown, Calendar, Wallet } from 'lucide-react';

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

    // Smart Category Suggestion
    useEffect(() => {
        // Only run for new expenses or if user is typing
        if (initialData) return;

        const title = formData.title;
        if (!title || title.length < 3) return;

        const timeoutId = setTimeout(async () => {
            try {
                const { data } = await api.get(`/analytics/predict-category?title=${encodeURIComponent(title)}`);
                if (data.category_id) {
                    // Only update if user hasn't manually selected a different category (or if it's the default 1st one)
                    // For simplicity, we just update it. A more complex logic would check if dirty.
                    setFormData(prev => ({ ...prev, category_id: data.category_id }));
                }
            } catch (error) {
                console.error("Failed to predict category", error);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.title, initialData]);

    // Set default category when categories load
    useEffect(() => {
        if (!initialData && categories.length > 0 && !formData.category_id) {
            setTimeout(() => setFormData(prev => ({ ...prev, category_id: categories[0].id })), 0);
        }
    }, [categories, initialData]);

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

            // If we have an ID, it's an edit, otherwise it might be a pre-fill from Share Target
            // For pre-fills, we might want to default to the first category if none provided
            if (!categoryId && !initialData.id && categories.length > 0) {
                categoryId = categories[0].id;
            }

            setTimeout(() => setFormData(prev => ({
                ...prev,
                title: initialData.title || '',
                amount: initialData.amount || '',
                category_id: categoryId || '',
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

        const mutation = initialData?.id
            ? updateExpenseMutation.mutateAsync({ id: initialData.id, data: payload })
            : createExpenseMutation.mutateAsync(payload);

        mutation
            .then(() => {
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            })
            .catch((error) => {
                console.error("Failed to save expense", error);
                alert("Failed to save expense");
            });
    };

    const loading = createExpenseMutation.isPending || updateExpenseMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="What is this for?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Grocery Shopping"
                required
                fullWidth
                autoFocus
            />

            <div className="grid grid-cols-2 gap-5">
                <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    icon={<span className="font-bold text-slate-500">₹</span>}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    fullWidth
                />

                <Input
                    label="Date"
                    type="date"
                    icon={<Calendar size={18} />}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    fullWidth
                    className="pl-10" // Adjust padding for icon if needed, but Input component handles this mostly
                />
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
                        <ChevronDown size={18} />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    isLoading={loading}
                    className="flex-1 shadow-lg shadow-brand-200 dark:shadow-none"
                >
                    {initialData?.id ? 'Update Expense' : 'Add Expense'}
                </Button>
            </div>
        </form>
    );
}
