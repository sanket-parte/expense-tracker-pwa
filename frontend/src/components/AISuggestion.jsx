import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, MessageSquareQuote, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import api from '../lib/api';

export default function AISuggestion() {
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isConfigured, setIsConfigured] = useState(true);

    useEffect(() => {
        fetchSuggestion();
        checkConfiguration();
    }, []);

    const checkConfiguration = async () => {
        try {
            const { data } = await api.get('/ai/settings');
            setIsConfigured(data.is_set);
        } catch (e) {
            console.error("Failed to check AI config");
        }
    };

    const fetchSuggestion = async () => {
        try {
            const { data } = await api.get('/ai/suggestion');
            setSuggestion(data.suggestion);
        } catch (err) {
            console.error("Failed to fetch suggestion", err);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/ai/generate');
            if (data.suggestion) {
                setSuggestion({ content: data.suggestion, created_at: new Date().toISOString() });
            } else {
                // Handle case where backend might return a message string instead of object structure if changed
                setSuggestion({ content: data.suggestion || data.message || "No suggestion generated.", created_at: new Date().toISOString() });
            }
        } catch (err) {
            console.error(err);
            setError("Failed to generate suggestion. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isConfigured) {
        return (
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-100 dark:border-purple-500/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-purple-900/30 rounded-xl shadow-sm text-purple-600 dark:text-purple-400">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">AI Financial Advisor</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            Get personalized spending insights and money-saving tips powered by AI. Configure your API key to get started.
                        </p>
                        <Link to="/settings">
                            <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-300 dark:hover:bg-purple-900/30">
                                Configure AI Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden border-purple-100 dark:border-purple-500/20">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl text-purple-600 dark:text-purple-400 shadow-sm">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                Smart Insights
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">Beta</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI-powered analysis of your spending</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        title="Regenerate suggestion"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </Button>
                </div>

                <div className="min-h-[100px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-8 text-slate-400"
                            >
                                <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
                                <p className="text-sm">Analyzing your finances...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-3"
                            >
                                <AlertTriangle size={18} />
                                {error}
                            </motion.div>
                        ) : suggestion ? (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="prose prose-sm dark:prose-invert max-w-none"
                            >
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {suggestion.content || suggestion}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-right">
                                    Generated {new Date(suggestion.created_at || Date.now()).toLocaleDateString()}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700"
                            >
                                <MessageSquareQuote size={32} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">No insights generated yet</p>
                                <Button
                                    onClick={handleGenerate}
                                    variant="link"
                                    className="text-purple-600 dark:text-purple-400 text-xs mt-1"
                                >
                                    Generate First Insight
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Card>
    );
}
