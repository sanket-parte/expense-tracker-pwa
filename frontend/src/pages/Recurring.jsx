import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Trash2, Calendar, RefreshCcw, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { useForm } from 'react-hook-form';

import { useSettings } from '../context/SettingsContext';

const RecurringForm = ({ onSuccess, onClose }) => {
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
            const res = await api.post('/recurring/', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['recurring']);
            if (settings.autoSync && onSuccess) onSuccess();
        },
        onError: (err) => {
            setSubmitError(err.response?.data?.detail || 'Failed to create recurring expense');
        }
    });

    const onSubmit = async (data) => {
        setSubmitError('');
        const payload = {
            ...data,
            amount: parseFloat(data.amount),
            category_id: parseInt(data.category_id),
            next_due_date: new Date(data.next_due_date).toISOString()
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
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white"
                    placeholder="e.g. Netflix Subscription"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                            type="number"
                            step="0.01"
                            {...register('amount', { required: 'Required', min: 1 })}
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-bold text-slate-700 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <select
                        {...register('category_id', { required: 'Required' })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white"
                    >
                        <option value="">Select</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Frequency</label>
                    <select
                        {...register('frequency', { required: 'Required' })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Next Due</label>
                    <input
                        type="date"
                        {...register('next_due_date', { required: 'Required' })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white"
                    />
                    {errors.next_due_date && <p className="text-red-500 text-xs mt-1">{errors.next_due_date.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {createMutation.isPending ? 'Saving...' : 'Create Recurring Expense'}
            </button>
        </form>
    );
};

export default function Recurring() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: expenses, isLoading, error } = useQuery({
        queryKey: ['recurring'],
        queryFn: async () => {
            const res = await api.get('/recurring/');
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/recurring/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['recurring']);
        }
    });

    if (isLoading) return <Loading />;
    if (error) return <div className="text-red-500">Error loading recurring expenses</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recurring Expenses</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Automate your fixed monthly bills</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-200 active:scale-95"
                >
                    <Plus size={20} />
                    New
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expenses.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <RefreshCcw size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No recurring expenses</p>
                        <p className="text-sm">Add rent, subscriptions, or bills to track them automatically</p>
                    </div>
                ) : (
                    expenses.map((item) => (
                        <div key={item.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/40 dark:border-slate-800 shadow-glass group relative overflow-hidden hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-500/20">
                                        <RefreshCcw size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">{item.frequency}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteMutation.mutate(item.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-end justify-between mt-4">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Amount</p>
                                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">₹{item.amount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Next Due</p>
                                    <div className="flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-lg">
                                        <Calendar size={14} />
                                        {new Date(item.next_due_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Recurring Expense"
            >
                <RecurringForm
                    onSuccess={() => setIsModalOpen(false)}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
