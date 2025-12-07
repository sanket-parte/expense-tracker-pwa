import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BudgetOverview({ budgets }) {
    // Calculate totals
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
    const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
    const isOverBudget = totalSpent > totalBudget;
    const remaining = Math.max(totalBudget - totalSpent, 0);

    const data = [{
        name: 'Budget',
        value: percentage,
        fill: isOverBudget ? '#ef4444' : '#6366f1'
    }];

    return (
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden h-full">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-white/90">Monthly Budget</h3>
                        <p className="text-indigo-200 text-sm font-medium mt-1">
                            {isOverBudget ? 'Budget exceeded' : `${Math.round(100 - percentage)}% remaining`}
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                </div>

                <div className="flex items-end gap-6 mt-4">
                    <div className="flex-1">
                        <div className="mb-1 text-indigo-200 text-xs font-bold uppercase tracking-wider">Spent</div>
                        <div className="text-3xl font-extrabold tracking-tight">₹{totalSpent.toLocaleString()}</div>
                        <div className="mt-1 text-xs text-indigo-200 font-medium">of ₹{totalBudget.toLocaleString()}</div>
                    </div>

                    <div className="w-20 h-20 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                innerRadius="70%"
                                outerRadius="100%"
                                barSize={6}
                                data={data}
                                startAngle={90}
                                endAngle={-270}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar
                                    background={{ fill: 'rgba(255,255,255,0.1)' }}
                                    dataKey="value"
                                    cornerRadius={10}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                            {Math.round(percentage)}%
                        </div>
                    </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="mt-4 bg-black/20 rounded-full h-1.5 overflow-hidden w-full">
                    <div
                        className={cn("h-full rounded-full transition-all duration-1000", isOverBudget ? "bg-red-400" : "bg-emerald-400")}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="mt-2 flex justify-between text-xs font-medium text-indigo-200">
                    <span>₹0</span>
                    <span>₹{totalBudget.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
