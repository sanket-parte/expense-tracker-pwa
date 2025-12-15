import React, { useState } from 'react';
import { Radar, Check, Loader2, Plus, AlertCircle } from 'lucide-react';
import api from '../lib/api';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import { cn } from '../lib/utils';
import Button from './ui/Button';
import { useAI } from '../context/AIContext';

export default function SubscriptionScanner({ onAddSubscription }) {
    const { isAIEnabled } = useAI();
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [scanned, setScanned] = useState(false);

    if (!isAIEnabled) return null;

    const handleScan = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ai/recurring/detect');
            setSuggestions(data.suggestions || []);
            setScanned(true);
        } catch (error) {
            console.error("Scan failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (!scanned && !loading) {
        return (
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Radar className="animate-pulse" /> Subscription Detective
                        </h3>
                        <p className="text-indigo-100 max-w-md">
                            Let AI scan your recent history to find subscriptions you might have forgotten to track.
                        </p>
                    </div>
                    <Button
                        onClick={handleScan}
                        className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-lg font-bold px-6 py-3"
                    >
                        Scan Now
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mb-8 p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-slate-500 font-medium">Analyzing transaction patterns...</p>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-3xl flex items-center gap-4"
            >
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                    <Check size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-green-800 dark:text-green-300">All Good!</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">No untracked subscriptions detected in the last 90 days.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 space-y-4"
        >
            <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Radar size={18} className="text-indigo-500" /> Detected Subscriptions
                </h3>
                <button onClick={() => setScanned(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">{item.confidence > 0.8 ? 'High Conf' : 'Check'}</div>
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{item.title}</h4>
                        <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 my-1">₹{item.amount}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{item.reason}</p>

                        <Button
                            size="sm"
                            fullWidth
                            variant="primary"
                            icon={<Plus size={16} />}
                            onClick={() => onAddSubscription(item)}
                        >
                            Add {item.frequency}
                        </Button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
