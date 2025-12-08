import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCategories } from '../hooks/useQueries';
import { useCreateBudget } from '../hooks/useMutations';
import Button from './ui/Button';
import Input from './ui/Input';

export default function BudgetForm({ onSuccess }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [submitError, setSubmitError] = useState('');

    const { data: categories = [] } = useCategories();
    const createMutation = useCreateBudget();

    const onSubmit = async (data) => {
        setSubmitError('');
        const payload = {
            category_id: parseInt(data.category_id),
            amount: parseFloat(data.amount),
            period: 'monthly'
        };

        createMutation.mutate(payload, {
            onError: (err) => {
                setSubmitError(err.response?.data?.detail || 'Failed to create budget');
            }
        });

        // Instant close for better UX (Optimistic Update handles the UI)
        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {submitError}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <div className="relative">
                    <select
                        {...register('category_id', { required: 'Category is required' })}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white appearance-none"
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                {errors.category_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category_id.message}</p>}
            </div>

            <Input
                label="Monthly Limit"
                type="number"
                step="0.01"
                icon={<span className="text-slate-500 font-bold">₹</span>}
                {...register('amount', { required: 'Amount is required', min: 1 })}
                placeholder="0.00"
                error={errors.amount?.message}
                fullWidth
            />

            <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={createMutation.isPending}
                className="shadow-lg shadow-brand-200 dark:shadow-none"
            >
                Set Budget
            </Button>
        </form>
    );
}
