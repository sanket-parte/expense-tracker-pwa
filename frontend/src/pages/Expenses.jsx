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
                // React Query handles refetch/invalidation
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Expenses</h2>
                    <p className="text-slate-500">Manage your transactions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-md shadow-brand-200 transition-all font-medium active:scale-95"
                >
                    <Plus size={20} className="stroke-2" />
                    <span className="hidden sm:inline">Add Expense</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            <ExpenseFilters filters={filters} onChange={setFilters} categories={categories} />

            {isLoading ? (
                <div className="text-center py-20 text-slate-400 animate-pulse">Loading expenses...</div>
            ) : error ? (
                <div className="text-center py-20 text-red-400">Error loading expenses</div>
            ) : expenses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Plus size={24} />
                    </div>
                    <p className="text-slate-500 mb-2 font-medium">No expenses found</p>
                    <p className="text-slate-400 text-sm mb-6">Start tracking your spending</p>
                    <button onClick={handleAdd} className="text-brand-600 font-medium hover:underline">
                        Add your first expense
                    </button>
                </div>
            ) : (
                <div className="space-y-3 pb-8">
                    {expenses.map((expense, index) => {
                        if (expenses.length === index + 1) {
                            return (
                                <div ref={lastExpenseElementRef} key={expense.id}>
                                    <ExpenseItem
                                        expense={expense}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <ExpenseItem
                                    key={expense.id}
                                    expense={expense}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            );
                        }
                    })}
                    {isFetchingNextPage && <div className="text-center py-4 text-slate-400">Loading more...</div>}
                    {!hasNextPage && expenses.length > 0 && (
                        <div className="text-center py-6">
                            <span className="px-3 py-1 bg-slate-100 text-slate-400 text-xs rounded-full font-medium">End of list</span>
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
