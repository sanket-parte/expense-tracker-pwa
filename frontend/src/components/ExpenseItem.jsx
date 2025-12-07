import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Calendar, Tag } from 'lucide-react';


export default function ExpenseItem({ expense, color, onEdit, onDelete }) {
    const categoryColor = expense.category?.color || color;

    return (
        <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg p-5 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm hover:shadow-glass hover:bg-white/90 dark:hover:bg-slate-800/90 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] touch-manipulation z-10 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4 w-full sm:w-auto">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner shrink-0 transition-transform group-hover:scale-105 group-hover:rotate-3"
                        style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, boxShadow: `inset 0 0 10px ${categoryColor}10` }}
                    >
                        {expense.category?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-lg tracking-tight group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{expense.title}</h4>
                            {/* Mobile Amount - Visible on top right */}
                            <div className="sm:hidden font-bold text-slate-900 dark:text-white text-lg">
                                -₹{expense.amount.toFixed(2)}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-lg">
                                <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
                                {format(new Date(expense.date), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: `${categoryColor}10`, color: categoryColor }}>
                                <Tag size={12} style={{ color: categoryColor }} />
                                {expense.category?.name || 'Uncategorized'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100/50 dark:border-slate-800/50 mt-2 sm:mt-0">
                    <span className="hidden sm:block font-bold text-slate-900 dark:text-white text-xl tracking-tight">-₹{expense.amount.toFixed(2)}</span>

                    <div className="flex gap-2 w-full sm:w-auto justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-x-0 sm:translate-x-2 sm:group-hover:translate-x-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                            className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-500/50 hover:shadow-md active:scale-95"
                        >
                            <Edit2 size={16} strokeWidth={2.5} />
                            <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                            className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-500/50 hover:shadow-md active:scale-95"
                        >
                            <Trash2 size={16} strokeWidth={2.5} />
                            <span className="sm:hidden">Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
