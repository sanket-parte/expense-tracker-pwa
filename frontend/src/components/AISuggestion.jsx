import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, MessageSquareQuote, AlertTriangle, Lightbulb, Target, TrendingUp } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
        } catch {
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
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-100 dark:border-indigo-500/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700" />

                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 bg-white dark:bg-indigo-900/30 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-50 dark:ring-indigo-500/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">AI Financial Advisor</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                            Unlock personalized spending insights and smart money-saving strategies powered by AI.
                            Connect your OpenAI API key to get started.
                        </p>
                        <Link to="/settings">
                            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all">
                                Configure AI Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden border-indigo-100 dark:border-indigo-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                            <Sparkles size={22} className="animate-pulse-slow" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                Smart Insights
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">Beta</span>
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">AI-powered analysis of your financial health</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all rounded-full w-10 h-10 p-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:scale-105 active:scale-95"
                        title="Regenerate insights"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </Button>
                </div>

                <div className="min-h-[120px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-4"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Analyzing spending patterns...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/20"
                            >
                                <AlertTriangle size={20} className="shrink-0" />
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        ) : suggestion ? (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                        <ReactMarkdown
                                            components={{
                                                // eslint-disable-next-line no-unused-vars
                                                ul: ({ node, ...props }) => <ul className="space-y-3 my-4 list-none pl-0" {...props} />,
                                                // eslint-disable-next-line no-unused-vars
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                                // eslint-disable-next-line no-unused-vars
                                                li: ({ node, ...props }) => (
                                                    <li className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 group">
                                                        <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                                            <Lightbulb size={14} />
                                                        </div>
                                                        <div className="flex-1 [&>strong]:text-indigo-700 dark:[&>strong]:text-indigo-400 [&>strong]:font-semibold">
                                                            {props.children}
                                                        </div>
                                                    </li>
                                                ),
                                                // eslint-disable-next-line no-unused-vars
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                // eslint-disable-next-line no-unused-vars
                                                a: ({ node, ...props }) => <a className="text-brand-600 hover:underline" {...props} />,
                                                // eslint-disable-next-line no-unused-vars
                                                strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                                            }}
                                        >
                                            {suggestion.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <Sparkles size={12} />
                                    <span>Generated {new Date(suggestion.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700"
                            >
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3">
                                    <TrendingUp size={32} className="text-indigo-500 opacity-80" />
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ready to analyze your finances?</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4 text-center max-w-[200px]">Get insights on your expense habits and saving opportunities.</p>
                                <Button
                                    onClick={handleGenerate}
                                    variant="outline"
                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                                >
                                    Generate Insights
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Card>
    );
}
