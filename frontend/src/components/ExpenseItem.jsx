import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ExpenseItem({ expense, color, onEdit, onDelete }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: `${color}20`, color: color }}
                >
                    {expense.category[0]}
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800">{expense.title}</h4>
                    <p className="text-xs text-slate-500">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900">-₹{expense.amount.toFixed(2)}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(expense)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-full">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(expense.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
