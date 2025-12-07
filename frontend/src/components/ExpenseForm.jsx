import React, { useState, useEffect } from 'react';
import api from '../lib/api';

export default function ExpenseForm({ initialData, onSuccess, onClose }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories/');
                setCategories(res.data);
                if (!initialData && res.data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, [initialData]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                amount: initialData.amount,
                category_id: initialData.category?.id || initialData.category_id,
                date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString(),
                category_id: parseInt(formData.category_id),
            };

            if (initialData?.id) {
                await api.patch(`/expenses/${initialData.id}`, payload);
            } else {
                await api.post('/expenses/', payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save expense", error);
            alert("Failed to save expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">What is this for?</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="e.g. Grocery Shopping"
                />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <div className="relative">
                    <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none font-medium text-slate-900"
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-colors active:scale-95"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold shadow-lg shadow-brand-200 transition-all active:scale-95 disabled:opacity-70 disabled:shadow-none"
                >
                    {loading ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
                </button>
            </div>
        </form>
    );
}
