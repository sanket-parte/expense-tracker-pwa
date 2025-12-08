import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { Loader2 } from 'lucide-react';

import { useSettings } from '../context/SettingsContext';

export default function BudgetForm({ onSuccess, onClose }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const queryClient = useQueryClient();
    const [submitError, setSubmitError] = useState('');
    const { settings } = useSettings();

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories/');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/budgets/', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            // Only call onSuccess here if autoSync is ON, 
            // otherwise we handle it manually in onSubmit to avoid waiting
            if (settings.autoSync && onSuccess) onSuccess();
        },
        onError: (err) => {
            setSubmitError(err.response?.data?.detail || 'Failed to create budget');
        }
    });

    const onSubmit = async (data) => {
        setSubmitError('');
        const payload = {
            category_id: parseInt(data.category_id),
            amount: parseFloat(data.amount),
            period: 'monthly'
        };

        if (settings.autoSync) {
            await createMutation.mutateAsync(payload);
        } else {
            createMutation.mutate(payload);
            if (onSuccess) onSuccess();
        }
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
                <select
                    {...register('category_id', { required: 'Category is required' })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white"
                >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monthly Limit</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        step="0.01"
                        {...register('amount', { required: 'Amount is required', min: 1 })}
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-bold text-slate-700 dark:text-white"
                        placeholder="0.00"
                    />
                </div>
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>

            <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {createMutation.isPending ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                    </>
                ) : (
                    'Set Budget'
                )}
            </button>
        </form>
    );
}
