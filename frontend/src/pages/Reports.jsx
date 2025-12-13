import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Download, BarChart2, PieChart, TrendingUp, DollarSign } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import api from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MonthlyReportCard from '../components/MonthlyReportCard';
// eslint-disable-next-line no-unused-vars
import { useDashboardStats } from '../hooks/useQueries';
// eslint-disable-next-line no-unused-vars
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/utils';

export default function Reports() {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    const monthStr = currentDate.format('YYYY-MM');

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/ analytics / monthly - report ? month = ${monthStr} `);
                setReportData(data);
            } catch (error) {
                console.error("Failed to fetch report", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [monthStr]);

    const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
    const handleNextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

    if (loading && !reportData) {
        return (
            <div className="flex h-full items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Generating Report...</p>
                </div>
            </div>
        );
    }

    const maxDaily = reportData?.daily_trend?.reduce((acc, curr) => Math.max(acc, curr.amount), 0) || 1;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header with Date Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Monthly Report</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Insights and trends for your spending</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-lg w-32 text-center text-slate-800 dark:text-slate-200">
                        {currentDate.format('MMMM YYYY')}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        disabled={currentDate.isAfter(dayjs(), 'month')}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Monthly Audit AI Card */}
            <div className="mb-8">
                <MonthlyReportCard month={monthStr} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-brand-500 to-violet-600 text-white border-none shadow-xl shadow-brand-500/20">
                    <div className="flex items-center gap-3 mb-2 opacity-90">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <DollarSign size={20} className="text-white" />
                        </div>
                        <span className="font-medium">Total Spent</span>
                    </div>
                    <div className="text-4xl font-bold tracking-tight">
                        {formatCurrency(reportData?.total_expense || 0)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm font-medium opacity-90">
                        <span>{reportData?.days_considered} days active</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="font-medium">Daily Average</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(reportData?.avg_daily || 0)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 font-medium">
                        Per active day
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                            <PieChart size={20} />
                        </div>
                        <span className="font-medium">Top Category</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
                        {reportData?.category_breakdown?.[0]?.name || "N/A"}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 font-medium flex justify-between">
                        <span>Most frequent spend</span>
                        <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(reportData?.category_breakdown?.[0]?.value || 0)}</span>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Daily Spending Bar Chart (CSS-only for lightweight) */}
                <Card className="p-6 lg:col-span-1 min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart2 size={20} className="text-brand-500" />
                        Daily Trend
                    </h3>

                    <div className="flex items-end justify-between h-64 gap-1 sm:gap-2">
                        {reportData?.daily_trend?.map((day, i) => (
                            <div key={i} className="group relative flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <div
                                    className="w-full bg-brand-500/80 hover:bg-brand-500 dark:bg-brand-500/60 dark:hover:bg-brand-500 rounded-t-md transition-all relative"
                                    style={{ height: `${(day.amount / maxDaily) * 100}% `, minHeight: '4px' }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        {formatCurrency(day.amount)} <br /> {dayjs(day.date).format('MMM D')}
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400 hidden sm:block rotate-[-45deg] origin-top-left translate-y-2">
                                    {dayjs(day.date).format('D')}
                                </span>
                            </div>
                        ))}
                        {(!reportData?.daily_trend || reportData.daily_trend.length === 0) && (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 italic">No data for this period</div>
                        )}
                    </div>
                </Card>

                {/* Category Breakdown */}
                <Card className="p-6 lg:col-span-1 min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-brand-500" />
                        Category Breakdown
                    </h3>

                    <div className="space-y-4">
                        {reportData?.category_breakdown?.map((cat) => (
                            <div key={cat.name} className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cat.value)}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(cat.value / reportData.total_expense) * 100}% `,
                                            backgroundColor: cat.color
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!reportData?.category_breakdown || reportData.category_breakdown.length === 0) && (
                            <div className="flex items-center justify-center h-40 text-slate-400 italic">No category data</div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="flex justify-center pt-8 opacity-50">
                <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Download size={16} /> Print Report
                </button>
            </div>
        </div>
    );
}
