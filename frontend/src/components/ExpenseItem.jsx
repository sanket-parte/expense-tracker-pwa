import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExpenseItem({ expense, color, onEdit, onDelete }) {
    const categoryColor = expense.category?.color || color;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.01, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/50 dark:border-slate-800 transition-all shadow-sm hover:shadow-glass-lg hover:bg-white/90 dark:hover:bg-slate-800/90 z-10 w-full overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 dark:via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform ease-in-out" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-5 w-full sm:w-auto">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6 ring-1 ring-black/5 dark:ring-white/10"
                        style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                    >
                        {expense.category?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-lg tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{expense.title}</h4>
                            {/* Mobile Amount - Visible on top right */}
                            <div className="sm:hidden font-extrabold text-slate-900 dark:text-white text-lg">
                                -₹{expense.amount.toFixed(2)}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
                                {format(new Date(expense.date), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-transparent" style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}>
                                <Tag size={12} style={{ color: categoryColor }} />
                                {expense.category?.name || 'Uncategorized'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/50 mt-2 sm:mt-0">
                    <span className="hidden sm:block font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">-₹{expense.amount.toFixed(2)}</span>

                    <div className="flex gap-2 w-full sm:w-auto justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-x-0 sm:translate-x-2 sm:group-hover:translate-x-0">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                            className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-500/50"
                        >
                            <Edit2 size={16} strokeWidth={2.5} />
                            <span className="sm:hidden">Edit</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                            className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-500/50"
                        >
                            <Trash2 size={16} strokeWidth={2.5} />
                            <span className="sm:hidden">Delete</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
