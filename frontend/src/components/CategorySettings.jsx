import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import api from '../lib/api';

export default function CategorySettings() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', color: '#64748b' });
    const [loading, setLoading] = useState(true);

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

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.name) return;

        try {
            await api.post('/categories/', newCategory);
            setNewCategory({ name: '', color: '#64748b' });
            fetchCategories();
        } catch (error) {
            alert("Failed to add category. Name might be duplicate.");
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

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Manage Categories</h3>

            {/* Add Category Form */}
            <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-xl">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Category Name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    {colors.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setNewCategory({ ...newCategory, color: c })}
                            className={`w-6 h-6 rounded-full border-2 ${newCategory.color === c ? 'border-slate-800' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2"
                >
                    <Plus size={18} /> Add
                </button>
            </form>

            {/* Category List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="font-medium text-slate-700">{cat.name}</span>
                        </div>
                        <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
