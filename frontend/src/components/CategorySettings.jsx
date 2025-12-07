import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Check, AlertCircle, Search } from 'lucide-react';
import api from '../lib/api';

export default function CategorySettings() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', color: '#64748b' });
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const colors = [
        '#64748b', // Slate
        '#ef4444', // Red
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#06b6d4', // Cyan
        '#3b82f6', // Blue
        '#6366f1', // Indigo
        '#d946ef', // Fuchsia
        '#ec4899', // Pink
    ];

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories/');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openModal = () => {
        setError(null);
        setNewCategory({ name: '', color: '#64748b' });
        setIsModalOpen(true);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;
        setError(null);

        try {
            await api.post('/categories/', newCategory);
            setNewCategory({ name: '', color: '#64748b' });
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            setError("Failed to add category. Name might be duplicate.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this category? Linked expenses will remain but lose color mapping.')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Categories</h3>
                    <p className="text-slate-500 text-sm">Manage your expense categories</p>
                </div>
                <button
                    onClick={openModal}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4 relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm"
                />
            </div>

            {/* Category List - Scrollable Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-2">
                    {filteredCategories.map(cat => (
                        <div key={cat.id} className="group relative flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                                style={{ backgroundColor: cat.color }}
                            >
                                {cat.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-700 truncate">{cat.name}</h4>
                            </div>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                                title="Delete Category"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {filteredCategories.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        {searchQuery ? 'No categories match your search.' : 'No categories found. Create one to get started.'}
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 transform transition-all scale-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800">New Category</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Groceries, Rent"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-slate-800"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Color Tag
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setNewCategory({ ...newCategory, color: c })}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${newCategory.color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                                            style={{ backgroundColor: c }}
                                        >
                                            {newCategory.color === c && <Check size={16} className="text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Badge */}
                            <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-center gap-2 border border-slate-100">
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mr-2">Preview:</span>
                                <div className="px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2 shadow-sm" style={{ backgroundColor: newCategory.color }}>
                                    <span>{newCategory.name || 'Category Name'}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newCategory.name.trim()}
                                    className="flex-1 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20"
                                >
                                    Create Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
