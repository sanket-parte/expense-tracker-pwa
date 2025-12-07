import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import ExpenseItem from '../components/ExpenseItem';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseFilters from '../components/ExpenseFilters';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const observer = React.useRef();
    const LIMIT = 20;

    const lastExpenseElementRef = React.useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        type: '',
        start_date: '',
        end_date: '',
        min_amount: '',
        max_amount: ''
    });

    // Reset on filter change
    useEffect(() => {
        setExpenses([]);
        setPage(0);
        setHasMore(true);
        // We don't fetch here immediately if we rely on the page effect, 
        // but we need to debounce.
        const timer = setTimeout(() => {
            // We can just reset page to 0, and let the page effect handle it?
            // Or explicitly call fetch with reset.
            fetchData(0, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    // Fetch on page change (except initial 0 which is handled by filter effect mostly, 
    // but to avoid double fetch we need to be careful. 
    // Simplified: Filter effect calls fetchData(0), scroll calls setPage(prev+1) -> fetchData(page)
    useEffect(() => {
        if (page > 0) fetchData(page, false);
    }, [page]);

    const fetchData = async (pageNumber = 0, isReset = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            // Add Pagination params
            params.append('offset', pageNumber * LIMIT);
            params.append('limit', LIMIT);

            // Fetch categories only once if needed, or check if we have them
            const promises = [api.get(`/expenses/?${params.toString()}`)];
            if (Object.keys(categories).length === 0) {
                promises.push(api.get('/categories/'));
            }

            const [expRes, catRes] = await Promise.all(promises);

            const newExpenses = expRes.data;
            setHasMore(newExpenses.length === LIMIT);

            if (isReset) {
                setExpenses(newExpenses);
            } else {
                setExpenses(prev => [...prev, ...newExpenses]);
            }

            if (catRes) {
                const catMap = {};
                catRes.data.forEach(c => {
                    catMap[c.name] = c.color;
                });
                setCategories(catMap);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };




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
                await api.delete(`/expenses/${id}`);
                await api.delete(`/expenses/${id}`);
                // Refresh cleanly to keep state consistent
                fetchData(0, true);
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleSuccess = () => {
        // Refresh list from top
        fetchData(0, true);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Expenses</h2>
                    <p className="text-slate-500">Manage your transactions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 shadow-md shadow-violet-200 transition-all font-medium"
                >
                    <Plus size={20} />
                    Add Expense
                </button>
            </div>

            <ExpenseFilters filters={filters} onChange={setFilters} categories={categories} />

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading expenses...</div>
            ) : expenses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500 mb-4">No expenses found</p>
                    <button onClick={handleAdd} className="text-violet-600 font-medium hover:underline">
                        Add your first expense
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {expenses.map((expense, index) => {
                        if (expenses.length === index + 1) {
                            return (
                                <div ref={lastExpenseElementRef} key={expense.id}>
                                    <ExpenseItem
                                        expense={expense}
                                        color={categories[expense.category] || '#64748b'}
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
                                    color={categories[expense.category] || '#64748b'}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            );
                        }
                    })}
                    {loading && <div className="text-center py-4 text-slate-400">Loading more...</div>}
                    {!hasMore && expenses.length > 0 && (
                        <div className="text-center py-4 text-slate-400 text-sm">No more expenses</div>
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
