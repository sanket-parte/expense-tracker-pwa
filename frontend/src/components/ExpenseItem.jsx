import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ExpenseItem({ expense, color, onEdit, onDelete }) {
    const categoryColor = expense.category?.color || color;

    return (
        <div className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-all active:scale-[0.99] touch-manipulation">
            <div className="flex items-start gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0"
                    style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                >
                    {expense.category?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 truncate pr-2 text-base">{expense.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {format(new Date(expense.date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full">
                            <Tag size={10} className="text-slate-400" />
                            {expense.category?.name || 'Uncategorized'}
                        </span>
                    </div>
                </div>
                {/* Mobile Amount - Visible on top right */}
                <div className="sm:hidden font-bold text-slate-900 text-lg">
                    -₹{expense.amount.toFixed(2)}
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-6 border-t sm:border-0 border-slate-50 pt-3 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                <span className="hidden sm:block font-bold text-slate-900 text-lg">-₹{expense.amount.toFixed(2)}</span>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={() => onEdit(expense)}
                        className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors border border-slate-100 hover:border-brand-200"
                    >
                        <Edit2 size={16} />
                        <span className="sm:hidden">Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(expense.id)}
                        className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-slate-100 hover:border-red-200"
                    >
                        <Trash2 size={16} />
                        <span className="sm:hidden">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
