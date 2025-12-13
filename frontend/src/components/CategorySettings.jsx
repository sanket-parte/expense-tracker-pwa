import React, { useState } from 'react';
import { Plus, X, Trash2, Check, AlertCircle, Search, Tags } from 'lucide-react';
import { useCategories } from '../hooks/useQueries';
import { useCreateCategory, useDeleteCategory } from '../hooks/useMutations';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { AnimatePresence, motion as Motion } from 'framer-motion';

export default function CategorySettings() {
    const { data: categories = [], isLoading } = useCategories();
    const createCategoryMutation = useCreateCategory();
    const deleteCategoryMutation = useDeleteCategory();

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
            await createCategoryMutation.mutateAsync(newCategory);
            setNewCategory({ name: '', color: '#64748b' });
            setIsModalOpen(false);
        } catch {
            setError("Failed to add category. Name might be duplicate.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this category? Linked expenses will remain but lose color mapping.')) {
            try {
                await deleteCategoryMutation.mutateAsync(id);
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="flex flex-col h-[600px] p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Tags className="text-brand-500" size={24} />
                            Categories
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage your expense categories</p>
                    </div>
                    <Button
                        onClick={openModal}
                        size="sm"
                        variant="primary"
                    >
                        <Plus size={18} className="mr-1.5" />
                        Add Category
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Category List - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredCategories.map(cat => (
                            <Motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={cat.id}
                                className="group relative flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all hover:-translate-y-0.5"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                >
                                    {cat.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 truncate">{cat.name}</h4>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                                    title="Delete Category"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </Motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredCategories.length === 0 && !isLoading && (
                    <div className="text-center py-16 text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                        <Tags size={32} className="mb-3 opacity-20" />
                        <p className="font-medium">{searchQuery ? 'No categories match your search.' : 'No categories found. Create one to get started.'}</p>
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl p-6 border border-white/20 dark:border-slate-700/50"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">New Category</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-6">
                                <Input
                                    label="Name"
                                    placeholder="e.g., Groceries, Rent"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    autoFocus
                                    required
                                    fullWidth
                                />

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">
                                        Color Tag
                                    </label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewCategory({ ...newCategory, color: c })}
                                                className={`w - 10 h - 10 rounded - xl flex items - center justify - center transition - all ${newCategory.color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 scale-110 shadow-lg' : 'hover:scale-105 hover:shadow'} `}
                                                style={{ backgroundColor: c }}
                                            >
                                                {newCategory.color === c && <Check size={18} className="text-white stroke-[3] drop-shadow-sm" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview Badge */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex items-center justify-center gap-3 border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Preview:</span>
                                    <div className="px-4 py-1.5 rounded-full text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all" style={{ backgroundColor: newCategory.color }}>
                                        <span>{newCategory.name || 'Category Name'}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-500/20 font-bold">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={!newCategory.name.trim()}
                                        className="flex-1 shadow-lg shadow-brand-500/20"
                                    >
                                        Create Category
                                    </Button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Card>
    );
}
