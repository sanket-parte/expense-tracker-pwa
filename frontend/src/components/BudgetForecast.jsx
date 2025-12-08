import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import Card from './ui/Card';

export default function BudgetForecast() {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const { data } = await api.get('/ai/budgets/forecast');
                setForecasts(data.forecasts || []);
            } catch (error) {
                console.error("Failed to load forecasts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, []);

    if (loading || forecasts.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-amber-500" size={20} /> Smart Insights
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
                {forecasts.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="border-l-4 border-l-amber-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <AlertTriangle size={80} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 dark:text-white">{item.category}</h4>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full uppercase">
                                        Projected to Overspend
                                    </span>
                                </div>

                                <div className="flex gap-4 text-sm mb-3">
                                    <div>
                                        <p className="text-slate-500">Budget</p>
                                        <p className="font-semibold">₹{item.budget}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Projected</p>
                                        <p className="font-bold text-red-500">₹{item.projected.toFixed(0)}</p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3 items-start">
                                    <TrendingUp size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                        "{item.advice}"
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
