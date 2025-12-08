import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import Card from './ui/Card';
import Button from './ui/Button';
import { formatCurrency } from '../lib/utils';

export default function MonthlyReportCard({ month }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchReport = async () => {
        try {
            const url = month ? `/reports/${month}` : '/reports/latest';
            const { data } = await api.get(url);
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [month]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const url = month ? `/reports/generate?month=${month}` : '/reports/generate';
            const { data } = await api.post(url);
            setReport(data);
        } catch (error) {
            console.error("Failed to generate", error);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl"></div>;

    if (!report) {
        return (
            <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none shadow-xl text-center p-8">
                <FileText size={48} className="mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">Monthly Audit</h3>
                <p className="text-blue-100 mb-6">Get a "Personal CFO" style review of your last month's spending.</p>
                <Button
                    onClick={handleGenerate}
                    isLoading={generating}
                    className="bg-white text-blue-600 hover:bg-blue-50 border-none font-bold"
                >
                    Generate Report
                </Button>
            </Card>
        );
    }

    const { analysis: rawAnalysis, total_spent, total_income, savings_rate, month: reportMonth } = report;
    const analysis = rawAnalysis || {};
    const gradeColor = {
        'A': 'text-green-500',
        'B': 'text-blue-500',
        'C': 'text-yellow-500',
        'D': 'text-orange-500',
        'F': 'text-red-500'
    }[analysis.grade?.[0]] || 'text-slate-500';

    return (
        <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Audit Report</h3>
                        <p className="text-sm text-slate-500">{reportMonth}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleGenerate} isLoading={generating}>
                    <RefreshCw size={16} />
                </Button>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Financial Grade</p>
                    <p className={`text-4xl font-black ${gradeColor}`}>{analysis.grade || '?'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Savings Rate</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{(savings_rate || 0).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(total_spent || 0)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Income</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(total_income || 0)}</p>
                </div>
            </div>

            {/* Analysis Grid */}
            <div className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30"
                >
                    <div className="text-red-500 mt-1"><AlertTriangle size={20} /></div>
                    <div>
                        <h4 className="font-bold text-red-700 dark:text-red-400 text-sm uppercase mb-1">Leakage Alert</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{analysis.leakage}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30"
                >
                    <div className="text-blue-500 mt-1"><TrendingUp size={20} /></div>
                    <div>
                        <h4 className="font-bold text-blue-700 dark:text-blue-400 text-sm uppercase mb-1">Inflation Check</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{analysis.inflation_check}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30"
                >
                    <div className="text-green-500 mt-1"><CheckCircle size={20} /></div>
                    <div>
                        <h4 className="font-bold text-green-700 dark:text-green-400 text-sm uppercase mb-1">Action Item</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">{analysis.action_item}</p>
                    </div>
                </motion.div>
            </div>
        </Card>
    );
}
