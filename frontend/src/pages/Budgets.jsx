import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import BudgetForm from '../components/BudgetForm';
import Loading from '../components/Loading';
import SwipeableItem from '../components/SwipeableItem';

import { useBudgets } from '../hooks/useQueries';

export default function Budgets() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: budgets, isLoading, error } = useBudgets();

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/budgets/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
        }
    });

    if (isLoading) return <Loading />;
    if (error) return <div className="text-red-500">Error loading budgets</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Budgets</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your monthly spending limits</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-200 active:scale-95"
                >
                    <Plus size={20} />
                    New Budget
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {budgets.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No budgets set yet</p>
                        <p className="text-sm">Create a budget to track your spending</p>
                    </div>
                ) : (
                    budgets.map((budget) => {
                        const percent = Math.min((budget.spent / budget.amount) * 100, 100);
                        const isOverBudget = budget.spent > budget.amount;
                        const isNearLimit = percent > 85;

                        return (
                            <SwipeableItem key={budget.id} id={budget.id} onDelete={() => deleteMutation.mutate(budget.id)}>
                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-glass group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold border border-brand-100 dark:border-brand-500/20">
                                                {budget.category?.name?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white">{budget.category?.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{budget.period}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteMutation.mutate(budget.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm font-bold mb-2">
                                                <span className={isOverBudget ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}>
                                                    ₹{budget.spent.toLocaleString()}
                                                </span>
                                                <span className="text-slate-400 dark:text-slate-500">
                                                    of ₹{budget.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-amber-400' : 'bg-brand-500'
                                                        }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs font-semibold">
                                            <span className={isOverBudget ? "text-red-500 dark:text-red-400" : isNearLimit ? "text-amber-500" : "text-emerald-500"}>
                                                {isOverBudget ? "Over Budget" : isNearLimit ? "Near Limit" : "On Track"}
                                            </span>
                                            <span className="text-slate-400 dark:text-slate-500">
                                                {Math.round(percent)}% Used
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwipeableItem>
                        );
                    })
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Set New Budget"
            >
                <BudgetForm
                    onSuccess={() => setIsModalOpen(false)}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
