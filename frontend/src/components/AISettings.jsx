import React, { useState, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { Brain, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import api from '../lib/api';
import { cn } from '../lib/utils';

export default function AISettings() {
    const { isAIEnabled, refreshAIConfig } = useAI();
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/ai/settings');
            if (data.openai_api_key) {
                setApiKey(data.openai_api_key); // Usually masked
            }
        } catch (error) {
            console.error("Failed to fetch AI settings", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await api.post('/ai/settings', {
                openai_api_key: apiKey,
                ai_provider: 'openai'
            });
            setMessage({ type: 'success', text: 'AI configuration saved successfully!' });
            await refreshAIConfig();
            setTimeout(() => setMessage(null), 3000);
        } catch {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Brain size={20} className="text-purple-500" />
                AI Assistant
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        OpenAI API Key
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Enter your OpenAI API key to enable smart spending suggestions on your dashboard.
                    </p>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={16} className="text-slate-400" />
                        </div>
                        <input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={isAIEnabled ? "••••••••••••••••" : "sk-..."}
                            className="block w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        {isAIEnabled && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                <CheckCircle2 size={12} />
                                Configured
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={handleSave}
                        isLoading={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-md shadow-purple-500/20"
                    >
                        Save Configuration
                    </Button>
                </div>

                {message && (
                    <div className={cn(
                        "p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-1",
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    )}>
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}
            </div>
        </Card>
    );
}
