import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon } from 'lucide-react';
import QuickAdd from '../components/QuickAdd';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import { cn } from '../lib/utils';
import { useDashboardStats } from '../hooks/useQueries';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const StatCard = ({ title, amount, icon: Icon, trend, color, labelColor, delay }) => (
    <div
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-glass transition-all hover:translate-y-[-2px] hover:shadow-xl group"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={cn("absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 blur-2xl", color)}></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={cn("p-3.5 rounded-2xl shadow-sm ring-1 ring-black/5", color.replace('bg-', 'bg-opacity-10 text-'))}>
                <Icon size={26} className={labelColor} />
            </div>
            {trend && (
                <div className={cn("flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border border-black/5", trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">₹{amount.toFixed(2)}</h3>
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
        setIsModalOpen(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-brand-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-brand-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-brand-600 font-semibold animate-pulse">Loading insights...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100 text-red-600 font-medium">
            Failed to load data. Please try again.
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Overview</h2>
                    <p className="text-slate-500 font-medium mt-1">Track your spending and savings in real-time</p>
                </div>
                <div className="text-sm font-bold text-brand-700 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/50 shadow-sm">
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
                    trend={12}
                    delay={0}
                />
                {/* <StatCard
                    title="Total Income"
                    amount={data.total_income}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                    labelColor="text-emerald-600"
                    trend={8}
                    delay={100}
                /> */}
                {/* <StatCard
                    title="Current Balance"
                    amount={data.balance}
                    icon={TrendingDown}
                    color="bg-blue-500"
                    labelColor="text-blue-600"
                    delay={200}
                /> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend Chart */}
                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-glass">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Spending Trend</h3>
                            <p className="text-xs text-slate-400 font-medium">Last 30 Days</p>
                        </div>
                        <select className="text-sm bg-slate-50/50 border-none rounded-xl text-slate-600 font-medium focus:ring-brand-500 cursor-pointer py-2 px-3 hover:bg-slate-100 transition-colors">
                            <option>Daily</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.daily_trend}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
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
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    formatter={(value) => [`₹${value.toFixed(2)}`, '']}
                                    labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3, boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Pie Chart */}
                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-glass flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Expense By Category</h3>
                    <p className="text-xs text-slate-400 font-medium mb-6">Distribution across top categories</p>

                    <div className="flex-1 min-h-[300px] flex flex-col md:flex-row items-center justify-center gap-8">
                        {data.category_breakdown.length > 0 ? (
                            <>
                                <div className="w-full md:w-1/2 h-56 md:h-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.category_breakdown}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                                cornerRadius={8}
                                                stroke="none"
                                            >
                                                {data.category_breakdown.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                                        style={{ filter: `drop-shadow(0px 0px 5px ${COLORS[index % COLORS.length]}40)` }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => `₹${value.toFixed(2)}`}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-2xl font-bold text-slate-700">₹{data.total_expense.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col gap-3 justify-center">
                                    {data.category_breakdown.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/50 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 8px ${COLORS[index % COLORS.length]}60` }} />
                                                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">{item.name}</span>
                                            </div>
                                            <span className="text-sm text-slate-500 font-mono font-bold">{(item.value / data.total_expense * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                                <div className="bg-slate-50 p-6 rounded-full mb-4">
                                    <PieChartIcon size={40} className="opacity-40" />
                                </div>
                                <p className="font-medium">No expense data yet</p>
                                <p className="text-sm opacity-60">Start adding expenses to see insights</p>
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
