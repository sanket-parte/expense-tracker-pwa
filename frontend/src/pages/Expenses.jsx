import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, PlusCircle, Sparkles } from 'lucide-react';
import ExpenseItem from '../components/ExpenseItem';
import SwipeableItem from '../components/SwipeableItem';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseFilters from '../components/ExpenseFilters';
import { useExpenses, useCategories } from '../hooks/useQueries';
import { useDeleteExpense } from '../hooks/useMutations';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../hooks/useQueries';

export default function Expenses() {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category_id: '',
        type: '',
        start_date: '',
        end_date: '',
        min_amount: '',
        max_amount: ''
    });

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            setFilters(prev => ({ ...prev, search: query }));
        }

        // Handle App Shortcut action
        const action = searchParams.get('action');
        if (action === 'new') {
            setIsModalOpen(true);
            // Clean URL without reload
            window.history.replaceState({}, '', '/expenses');
        }
    }, [searchParams]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useExpenses(filters);

    const { data: categories = [] } = useCategories();
    const deleteExpenseMutation = useDeleteExpense();

    const observer = useRef();
    const lastExpenseElementRef = useCallback(node => {
        if (isLoading || isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

    const handleAdd = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            deleteExpenseMutation.mutate(id, {
                onError: (error) => {
                    console.error("Failed to delete", error);
                    alert("Failed to delete expense");
                }
            });
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
    };

    const handleAutoCategorize = async () => {
        setIsScanning(true);
        try {
            const res = await api.post('/expenses/auto-categorize');
            if (res.data.processed_count > 0) {
                alert(`Successfully categorized ${res.data.processed_count} transactions!`);
                queryClient.invalidateQueries([QUERY_KEYS.expenses]);
                queryClient.invalidateQueries([QUERY_KEYS.dashboard]);
            } else {
                alert("No uncategorized transactions found or AI couldn't match any.");
            }
        } catch (err) {
            console.error("Auto-categorize failed", err);
            alert("Failed to auto-categorize expenses.");
        } finally {
            setIsScanning(false);
        }
    };

    // Flatten pages into a single array
    const expenses = data ? data.pages.flatMap(page => page) : [];

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Expenses</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your transactions</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        onClick={handleAutoCategorize}
                        variant="outline"
                        className="border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-900/20"
                        disabled={isScanning}
                    >
                        {isScanning ? (
                            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Sparkles size={18} className="mr-2" />
                        )}
                        {isScanning ? 'Scanning...' : 'Scan Uncategorized'}
                    </Button>
                    <Button
                        onClick={handleAdd}
                        variant="primary"
                        className="shadow-lg shadow-brand-200 dark:shadow-none flex-1 sm:flex-none"
                    >
                        <Plus size={22} className="stroke-[3px]" />
                        <span className="hidden sm:inline">Add Expense</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            <ExpenseFilters filters={filters} onChange={setFilters} categories={categories} />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-brand-100 dark:border-brand-900/30 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Loading transaction history...</p>
                </div>
            ) : error && expenses.length === 0 ? (
                <Card className="text-center py-20 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-500/20 text-red-500 font-semibold">
                    Error loading expenses. Please try again.
                </Card>
            ) : expenses.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="text-center py-24 flex flex-col items-center border-dashed">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 ring-8 ring-slate-50 dark:ring-slate-800">
                            <PlusCircle size={40} />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xl font-bold mb-2">No expenses found</p>
                        <p className="text-slate-400 dark:text-slate-500 mb-8 max-w-xs mx-auto">Your expense history is empty. Start tracking your spending now!</p>
                        <Button variant="accent" onClick={handleAdd}>
                            Add your first expense
                        </Button>
                    </Card>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {expenses.map((expense, index) => {
                            const isLast = expenses.length === index + 1;
                            return (
                                <motion.div
                                    ref={isLast ? lastExpenseElementRef : null}
                                    key={expense.id}
                                    layout
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3, delay: index < 10 ? index * 0.05 : 0 }}
                                >
                                    <SwipeableItem id={expense.id} onDelete={handleDelete} onEdit={() => handleEdit(expense)}>
                                        <ExpenseItem
                                            expense={expense}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    </SwipeableItem>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {isFetchingNextPage && (
                        <div className="flex justify-center py-6">
                            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                        </div>
                    )}
                    {!hasNextPage && expenses.length > 5 && (
                        <div className="text-center py-8">
                            <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs rounded-full font-bold uppercase tracking-wider">End of list</span>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
            >
                <ExpenseForm
                    initialData={editingExpense}
                    onSuccess={handleSuccess}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}

