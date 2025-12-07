import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon } from 'lucide-react';
import QuickAdd from '../components/QuickAdd';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import { cn } from '../lib/utils';
import { useDashboardStats } from '../hooks/useQueries';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

const StatCard = ({ title, amount, icon: Icon, trend, color, subValue, labelColor }) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
        <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150", color)}></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={cn("p-3 rounded-xl", color.replace('bg-', 'bg-opacity-10 text-'))}>
                <Icon size={24} className={labelColor} />
            </div>
            {trend && (
                <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">₹{amount.toFixed(2)}</h3>
        </div>
    </div>
);

export default function Dashboard() {
    const { data, isLoading: loading, error } = useDashboardStats();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quickAddData, setQuickAddData] = useState(null);

    const handleQuickAdd = (parsedData) => {
        setQuickAddData(parsedData);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        // Refetching is handled automatically by React Query invalidation in mutations
        setIsModalOpen(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium animate-pulse">Loading financial insights...</p>
            </div>
        </div>
    );

    if (error) return <div className="p-8 text-center text-slate-500">Failed to load data</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Financial Overview</h2>
                    <p className="text-slate-500 mt-1">Track your spending and savings in real-time</p>
                </div>
                <div className="text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <QuickAdd onQuickAdd={handleQuickAdd} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Expenses"
                    amount={data.total_expense}
                    icon={Wallet}
                    color="bg-brand-500"
                    labelColor="text-brand-600"
                />
                <StatCard
                    title="Total Income"
                    amount={data.total_income}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                    labelColor="text-emerald-600"
                />
                <StatCard
                    title="Current Balance"
                    amount={data.balance}
                    icon={TrendingDown}
                    color="bg-blue-500"
                    labelColor="text-blue-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Spending Trend</h3>
                        <select className="text-sm bg-slate-50 border-none rounded-lg text-slate-500 focus:ring-brand-500 cursor-pointer">
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.daily_trend}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return `${date.getDate()}/${date.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                                    labelStyle={{ color: '#64748b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Expense By Category</h3>
                    <div className="flex-1 min-h-[300px] flex flex-col md:flex-row items-center justify-center gap-8">
                        {data.category_breakdown.length > 0 ? (
                            <>
                                <div className="w-full md:w-1/2 h-48 md:h-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.category_breakdown}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                                cornerRadius={6}
                                            >
                                                {data.category_breakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => `₹${value.toFixed(2)}`}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <p className="text-xs text-slate-400 font-medium">Distribution</p>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col gap-3 justify-center">
                                    {data.category_breakdown.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between group cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{item.name}</span>
                                            </div>
                                            <span className="text-sm text-slate-400 font-mono">{(item.value / data.total_expense * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <PieChartIcon size={48} className="mb-2 opacity-50" />
                                <p>No expense data yet</p>
                            </div>
                        )}
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
