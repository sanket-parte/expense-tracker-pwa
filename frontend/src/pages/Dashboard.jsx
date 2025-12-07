import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';
import QuickAdd from '../components/QuickAdd';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import api from '../lib/api';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quickAddData, setQuickAddData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/analytics/dashboard');
            setData(res.data);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdd = (parsedData) => {
        setQuickAddData(parsedData);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        loadData();
        setIsModalOpen(false);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading insights...</div>;
    if (!data) return <div className="p-8 text-center text-slate-500">Failed to load data</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-slate-500">Overview of your finances</p>
            </div>

            {/* Quick Add */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                    <QuickAdd onQuickAdd={handleQuickAdd} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Wallet className="text-white" size={24} />
                        </div>
                    </div>
                    <p className="text-violet-100">Total Expenses</p>
                    <h3 className="text-3xl font-bold mt-1">₹{data.total_expense.toFixed(2)}</h3>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <TrendingUp className="text-emerald-600" size={24} />
                            </div>
                        </div>
                        <p className="text-slate-500">Total Income</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">₹{data.total_income.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingDown className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <p className="text-slate-500">Balance</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">₹{data.balance.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Spending Trend (Last 30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.daily_trend}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Expense Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        {data.category_breakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.category_breakdown}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.category_breakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-400">No data available</p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                        {data.category_breakdown.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-sm text-slate-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Complete Quick Add"
            >
                <ExpenseForm
                    initialData={quickAddData}
                    onSuccess={handleSuccess}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
