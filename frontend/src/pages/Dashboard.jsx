import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import QuickAdd from '../components/QuickAdd';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import PullToRefresh from '../components/PullToRefresh';
import BudgetOverview from '../components/BudgetOverview';
import RecentTransactions from '../components/RecentTransactions';
import Card from '../components/ui/Card';
import { cn } from '../lib/utils';
import { useDashboardStats, useBudgets } from '../hooks/useQueries';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StatCard = ({ title, amount, icon: Icon, trend, color, labelColor }) => (
    <Card hover className="relative overflow-hidden group">
        <div className={cn("absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150 blur-3xl", color)} />

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={cn("p-3.5 rounded-2xl shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10 backdrop-blur-sm transition-transform group-hover:scale-110 duration-300", color.replace('bg-', 'bg-opacity-10 text-'))}>
                <Icon size={26} className={labelColor} />
            </div>
            {trend && (
                <div className={cn("flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border border-black/5 dark:border-white/10 backdrop-blur-md", trend > 0 ? "bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-400")}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">₹{amount.toFixed(2)}</h3>
        </div>
    </Card>
);

export default function Dashboard() {
    const queryClient = useQueryClient();
    const { data, isLoading: loading, error, refetch } = useDashboardStats();
    const { data: budgets } = useBudgets();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quickAddData, setQuickAddData] = useState(null);

    const handleQuickAdd = (parsedData) => {
        setQuickAddData(parsedData);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
    };

    const handleRefresh = async () => {
        await Promise.all([
            refetch(),
            queryClient.invalidateQueries(['expenses']),
            queryClient.invalidateQueries(['budgets'])
        ]);
    };

    // Trigger recurring expense value generation
    useEffect(() => {
        api.post('/recurring/process').then(() => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['stats']);
        }).catch(console.error);
    }, [queryClient]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-brand-100 dark:border-brand-900/30 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-brand-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-brand-600 dark:text-brand-400 font-semibold animate-pulse">Loading insights...</p>
            </div>
        </div>
    );

    if (error && !data) return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium">
                Failed to load data. Use Pull to Refresh to try again.
            </div>
        </PullToRefresh>
    );

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <motion.div
                className="space-y-8 pb-20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Overview</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Track your spending and savings in real-time</p>
                    </div>
                    <div className="text-sm font-bold text-brand-700 dark:text-brand-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/50 dark:border-slate-700 shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-transform hover:scale-105 cursor-default">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="relative z-20">
                    <QuickAdd onQuickAdd={handleQuickAdd} />
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Key Metrics */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <motion.div variants={itemVariants}>
                                <StatCard
                                    title="Total Expenses"
                                    amount={data.total_expense}
                                    icon={Wallet}
                                    color="bg-brand-500"
                                    labelColor="text-brand-600"
                                    trend={12}
                                />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                {/* Placeholder for Income or Savings if available later - reusing Budget Overview logic */}
                                <BudgetOverview budgets={budgets || []} WrapperComponent={Card} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: Recent Activity */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
                        <RecentTransactions />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Spending Trend Chart */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Spending Trend</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Last 30 Days</p>
                                    </div>
                                </div>
                                <select className="text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium focus:ring-brand-500 cursor-pointer py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                </select>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.daily_trend}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-border-opacity, 0.1)" strokeOpacity={0.1} />
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
                                            cursor={{ stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                                padding: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            }}
                                            formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3, boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Categories Pie Chart */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                                    <PieChartIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Expense By Category</h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Distribution across top categories</p>
                                </div>
                            </div>

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
                                                <p className="text-2xl font-bold text-slate-700 dark:text-white">₹{data.total_expense.toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2 flex flex-col gap-3 justify-center">
                                            {data.category_breakdown.map((item, index) => (
                                                <div key={item.name} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 8px ${COLORS[index % COLORS.length]}60` }} />
                                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                                                    </div>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400 font-mono font-bold">{(item.value / data.total_expense * 100).toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                                            <PieChartIcon size={40} className="opacity-40" />
                                        </div>
                                        <p className="font-medium">No expense data yet</p>
                                        <p className="text-sm opacity-60">Start adding expenses to see insights</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
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
            </motion.div>
        </PullToRefresh>
    );
}
