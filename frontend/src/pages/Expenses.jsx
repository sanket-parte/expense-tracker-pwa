import React, { useState, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import ExpenseItem from '../components/ExpenseItem';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseFilters from '../components/ExpenseFilters';
import { useExpenses, useCategories } from '../hooks/useQueries';
import { useDeleteExpense } from '../hooks/useMutations';

export default function Expenses() {
    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        type: '',
        start_date: '',
        end_date: '',
        min_amount: '',
        max_amount: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

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

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                await deleteExpenseMutation.mutateAsync(id);
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
    };

    // Flatten pages into a single array
    const expenses = data ? data.pages.flatMap(page => page) : [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Expenses</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your transactions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 shadow-md shadow-brand-200 transition-all font-bold active:scale-95 group"
                >
                    <Plus size={22} className="stroke-2 group-hover:rotate-90 transition-transform" />
                    <span className="hidden sm:inline">Add Expense</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            <ExpenseFilters filters={filters} onChange={setFilters} categories={categories} />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Loading transaction history...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100 text-red-500 font-medium">
                    Error loading expenses. Please try again.
                </div>
            ) : expenses.length === 0 ? (
                <div className="text-center py-24 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 ring-8 ring-slate-50/50 dark:ring-slate-800/50">
                        <Plus size={32} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold mb-2">No expenses found</p>
                    <p className="text-slate-400 dark:text-slate-500 mb-8 max-w-xs mx-auto">Your expense history is empty. Start tracking your spending now!</p>
                    <button onClick={handleAdd} className="text-brand-600 dark:text-brand-400 font-bold hover:text-brand-700 dark:hover:text-brand-300 hover:underline decoration-2 underline-offset-4">
                        Add your first expense
                    </button>
                </div>
            ) : (
                <div className="space-y-4 pb-20 md:pb-8">
                    {expenses.map((expense, index) => {
                        const isLast = expenses.length === index + 1;
                        return (
                            <div
                                ref={isLast ? lastExpenseElementRef : null}
                                key={expense.id}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
                            >
                                <ExpenseItem
                                    expense={expense}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        );
                    })}
                    {isFetchingNextPage && (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
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
