import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { useBudgets } from '../hooks/useQueries';
import { useDeleteBudget } from '../hooks/useMutations';
import Modal from '../components/Modal';
import BudgetForm from '../components/BudgetForm';
import Loading from '../components/Loading';
import SwipeableItem from '../components/SwipeableItem';
import Card from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import BudgetForecast from '../components/BudgetForecast';

export default function Budgets() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: budgets, isLoading, error } = useBudgets();
    const deleteMutation = useDeleteBudget();

    if (isLoading) return <Loading />;
    if (error) return <Card className="p-8 text-center text-red-500 border-red-100 bg-red-50">Error loading budgets. Please try again.</Card>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Budgets</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your monthly spending limits</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                    className="shadow-lg shadow-brand-200 dark:shadow-none"
                >
                    <Plus size={20} className="mr-2" />
                    New Budget
                </Button>
            </div>

            <BudgetForecast />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {budgets.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} className="opacity-50" />
                            </div>
                            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">No budgets set yet</p>
                            <p className="text-sm max-w-xs mx-auto mt-1 mb-6">Create a budget to track your spending and save more.</p>
                            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create First Budget</Button>
                        </motion.div>
                    ) : (
                        budgets.map((budget, index) => {
                            const percent = Math.min((budget.spent / budget.amount) * 100, 100);
                            const isOverBudget = budget.spent > budget.amount;
                            const isNearLimit = percent > 85;

                            return (
                                <motion.div
                                    key={budget.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <SwipeableItem id={budget.id} onDelete={() => deleteMutation.mutate(budget.id)}>
                                        <Card hover className="h-full relative overflow-hidden border-t-4 border-t-brand-500">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold border border-brand-100 dark:border-brand-500/20 shadow-sm text-lg">
                                                        {budget.category?.name?.[0] || 'C'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{budget.category?.name}</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block mt-1">{budget.period}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteMutation.mutate(budget.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm font-bold mb-2">
                                                        <span className={isOverBudget ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}>
                                                            ₹{budget.spent.toLocaleString()}
                                                        </span>
                                                        <span className="text-slate-400 dark:text-slate-500">
                                                            of ₹{budget.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percent}%` }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-amber-400' : 'bg-brand-500'}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center text-xs font-semibold pt-2 border-t border-slate-50 dark:border-slate-800">
                                                    <span className={`flex items-center gap-1.5 ${isOverBudget ? "text-red-500 dark:text-red-400" : isNearLimit ? "text-amber-500" : "text-emerald-500"}`}>
                                                        {isOverBudget ? <AlertCircle size={14} /> : isNearLimit ? <AlertTriangle size={14} /> : <TrendingUp size={14} />}
                                                        {isOverBudget ? "Over Budget" : isNearLimit ? "Near Limit" : "On Track"}
                                                    </span>
                                                    <span className="text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                        {Math.round(percent)}% Used
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </SwipeableItem>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
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

