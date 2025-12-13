import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useCalendarExpenses } from '../hooks/useQueries';
import Card from '../components/ui/Card';
import ExpenseItem from '../components/ExpenseItem';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(null);

    // Calculate start and end of the visible month for fetching
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');

    // Format for API (usually ISO or YYYY-MM-DD)
    const startDateStr = startOfMonth.toISOString();
    const endDateStr = endOfMonth.toISOString();

    const { data: expenses = [] } = useCalendarExpenses(startDateStr, endDateStr);

    // Group expenses by date (YYYY-MM-DD keys)
    const expensesByDate = useMemo(() => {
        const groups = {};
        expenses.forEach(expense => {
            const dateKey = dayjs(expense.date).format('YYYY-MM-DD');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(expense);
        });
        return groups;
    }, [expenses]);

    // Calendar Grid Logic
    const startDayOfWeek = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = startOfMonth.daysInMonth();

    // Generate grid array
    // We need empty slots for days before start of month
    const gridDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        gridDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        gridDays.push(startOfMonth.date(i));
    }

    const prevMonth = () => setCurrentDate(curr => curr.subtract(1, 'month'));
    const nextMonth = () => setCurrentDate(curr => curr.add(1, 'month'));

    const toggleDateSelection = (date) => {
        const dateKey = date.format('YYYY-MM-DD');
        if (selectedDate === dateKey) {
            setSelectedDate(null);
        } else {
            setSelectedDate(dateKey);
        }
    };

    const selectedExpenses = selectedDate ? (expensesByDate[selectedDate] || []) : [];

    return (
        <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Calendar</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                        View spending by date
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 min-w-[120px] text-center">
                        {currentDate.format('MMMM YYYY')}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <Card className="lg:col-span-2 p-4 sm:p-6 overflow-hidden">
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {gridDays.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;

                            const dateKey = date.format('YYYY-MM-DD');
                            const dayExpenses = expensesByDate[dateKey] || [];
                            const totalAmount = dayExpenses.reduce((sum, ex) => sum + ex.amount, 0);
                            const hasExpenses = dayExpenses.length > 0;
                            const isSelected = selectedDate === dateKey;
                            const isToday = date.isSame(dayjs(), 'day');

                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => toggleDateSelection(date)}
                                    className={`
                                        aspect-square relative rounded-xl flex flex-col items-center justify-center transition-all duration-200
                                        ${isSelected
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105 z-10'
                                            : isToday
                                                ? 'bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                                        }
                                    `}
                                >
                                    <span className={`text-sm ${isSelected || isToday ? 'font-bold' : 'font-medium'}`}>
                                        {date.date()}
                                    </span>

                                    {hasExpenses && (
                                        <div className="flex flex-col items-center mt-1">
                                            <div className={`w-1 h-1 rounded-full mb-0.5 ${isSelected ? 'bg-white' : 'bg-brand-500'}`} />
                                            <span className={`text-[9px] font-medium hidden sm:block ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                                                ${totalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>

                {/* Selected Date Details */}
                <div className="lg:h-[600px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {selectedDate ? (
                            <motion.div
                                key={selectedDate}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                                        {dayjs(selectedDate).format('MMMM D, YYYY')}
                                    </h3>
                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        {selectedExpenses.length} transactions
                                    </span>
                                </div>

                                {selectedExpenses.length > 0 ? (
                                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                        {selectedExpenses.map(expense => (
                                            <ExpenseItem key={expense.id} expense={expense} readonly />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center flex-1 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                                        <AlertCircle size={32} className="mb-2 opacity-50" />
                                        <p className="text-sm">No expenses this day</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50"
                            >
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                                    <div className="grid grid-cols-2 gap-1 w-6 h-6 opacity-50">
                                        <div className="bg-current rounded-sm" />
                                        <div className="bg-current rounded-sm" />
                                        <div className="bg-current rounded-sm" />
                                        <div className="bg-current rounded-sm" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-1">Select a date</h3>
                                <p className="text-sm max-w-[200px]">Click on a date in the calendar to view transactions</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
