import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function BudgetOverview({ budgets, WrapperComponent = 'div' }) {
    // Calculate totals
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
    const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
    const isOverBudget = totalSpent > totalBudget;

    // Visualization data
    const data = [{
        name: 'Budget',
        value: percentage,
        fill: isOverBudget ? '#f87171' : '#fff' // White or Light Red for contrast on gradient
    }];

    const Content = (
        <div className="relative overflow-hidden h-full">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 opacity-30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-white/95 tracking-tight">Monthly Budget</h3>
                        <p className="text-indigo-100/80 text-sm font-medium mt-0.5">
                            {isOverBudget ? 'Budget exceeded' : `${Math.round(100 - percentage)}% remaining`}
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/10">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                </div>

                <div className="flex items-end gap-6 mt-4">
                    <div className="flex-1">
                        <div className="mb-1 text-indigo-200 text-xs font-bold uppercase tracking-wider">Spent</div>
                        <div className="text-3xl font-extrabold tracking-tight text-white">₹{totalSpent.toLocaleString()}</div>
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
                                    background={{ fill: 'rgba(255,255,255,0.2)' }}
                                    dataKey="value"
                                    cornerRadius={10}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-white">
                            {Math.round(percentage)}%
                        </div>
                    </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="mt-6 bg-black/20 rounded-full h-1.5 overflow-hidden w-full backdrop-blur-sm">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-full", isOverBudget ? "bg-red-400" : "bg-emerald-400")}
                    />
                </div>
            </div>
        </div>
    );

    // If wrapper is passed, we might need to handle styling differently.
    // Assuming WrapperComponent will handle the outer container styling (dimensions, rounded, etc)
    // But this component has a specific gradient background.
    // If we use Card as wrapper, we should probably pass className with the gradient.

    if (WrapperComponent === 'div') {
        return (
            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-white h-full relative group">
                {Content}
            </div>
        );
    }

    return (
        <WrapperComponent className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 text-white h-full border-none shadow-xl hover:shadow-brand-500/25 group">
            {Content}
        </WrapperComponent>
    );
}

