import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import CategorySettings from '../components/CategorySettings';
import { cn } from '../lib/utils';

export default function Settings() {
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleExport = () => {
        // Direct open to trigger download
        window.open('http://localhost:8000/data/export', '_blank');
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setMessage({ type: 'error', text: 'Please upload a valid CSV file.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setImporting(true);
        setMessage(null);
        try {
            await api.post('/data/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage({ type: 'success', text: 'Expenses imported successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to import expenses.' });
        } finally {
            setImporting(false);
            // Reset input
            e.target.value = null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your application preferences and data</p>
            </div>

            <CategorySettings />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Download size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Export Data</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                        Download all your expenses as a CSV file for backup or analysis in other tools.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Download size={18} />
                        Download CSV
                    </button>
                </div>

                {/* Import Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Import Data</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                        Upload a CSV file to bulk import expenses. Duplicate handling depends on your data.
                    </p>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImport}
                            disabled={importing}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                        />
                        <button
                            disabled={importing}
                            className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                        >
                            <Upload size={18} />
                            {importing ? 'Importing...' : 'Upload CSV'}
                        </button>
                    </div>
                </div>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2",
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                )}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}
        </div>
    );
}
