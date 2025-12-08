import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, RefreshCcw } from 'lucide-react';
import { useRecurring, useCategories } from '../hooks/useQueries';
import { useCreateRecurring, useDeleteRecurring } from '../hooks/useMutations';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { useForm } from 'react-hook-form';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SubscriptionScanner from '../components/SubscriptionScanner';

const RecurringForm = ({ initialData, onSuccess }) => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            amount: '',
            category_id: '',
            frequency: 'monthly',
            next_due_date: new Date().toISOString().split('T')[0]
        }
    });
    const [submitError, setSubmitError] = useState('');

    const { data: categories = [] } = useCategories();
    const createMutation = useCreateRecurring();

    useEffect(() => {
        if (initialData) {
            setValue('title', initialData.title);
            setValue('amount', initialData.amount);
            setValue('frequency', initialData.frequency || 'monthly');
            // If we had category matching logic, we could set category_id here too
        }
    }, [initialData, setValue]);

    const onSubmit = async (data) => {
        setSubmitError('');
        const payload = {
            ...data,
            amount: parseFloat(data.amount),
            category_id: parseInt(data.category_id),
            next_due_date: new Date(data.next_due_date).toISOString()
        };

        createMutation.mutate(payload, {
            onError: (err) => {
                setSubmitError(err.response?.data?.detail || 'Failed to create recurring expense');
            }
        });

        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {submitError}
                </div>
            )}

            <Input
                label="Title"
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Netflix Subscription"
                error={errors.title?.message}
                fullWidth
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    icon={<span className="text-slate-500 font-bold">₹</span>}
                    {...register('amount', { required: 'Required', min: 1 })}
                    placeholder="0.00"
                    error={errors.amount?.message}
                    fullWidth
                />

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <div className="relative">
                        <select
                            {...register('category_id', { required: 'Required' })}
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white appearance-none"
                        >
                            <option value="">Select</option>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Frequency</label>
                    <div className="relative">
                        <select
                            {...register('frequency', { required: 'Required' })}
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700 dark:text-white appearance-none"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                <Input
                    label="Next Due"
                    type="date"
                    {...register('next_due_date', { required: 'Required' })}
                    error={errors.next_due_date?.message}
                    fullWidth
                // Input component adds some padding for icon if present, here we might need adjustment or it's fine.
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={createMutation.isPending}
                className="shadow-lg shadow-brand-200 dark:shadow-none"
            >
                Create Recurring Expense
            </Button>
        </form>
    );
};

export default function Recurring() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(null);

    const { data: expenses, isLoading, error } = useRecurring();
    const deleteMutation = useDeleteRecurring();

    const handleAddSubscription = (sub) => {
        setFormData(sub);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setFormData(null);
        setIsModalOpen(true);
    };

    if (isLoading) return <Loading />;
    if (error) return <div className="text-red-500 p-8 text-center">Error loading recurring expenses</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recurring Expenses</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Automate your fixed monthly bills</p>
                </div>
                <Button
                    onClick={handleNew}
                    variant="primary"
                    className="shadow-lg shadow-brand-200 dark:shadow-none"
                >
                    <Plus size={20} className="mr-2" />
                    New
                </Button>
            </div>

            <SubscriptionScanner onAddSubscription={handleAddSubscription} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expenses.length === 0 ? (
                    <Card className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 border-dashed flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                        <RefreshCcw size={48} className="opacity-20" />
                        <div>
                            <p className="text-lg font-bold text-slate-600 dark:text-slate-400">No recurring expenses</p>
                            <p className="text-sm">Add rent, subscriptions, or bills to track them automatically</p>
                        </div>
                    </Card>
                ) : (
                    expenses.map((item) => (
                        <Card key={item.id} hover className="group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-500/20">
                                        <RefreshCcw size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{item.frequency}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteMutation.mutate(item.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
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
                        </Card>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={formData ? "Add Detected Subscription" : "Add Recurring Expense"}
            >
                <RecurringForm
                    initialData={formData}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
