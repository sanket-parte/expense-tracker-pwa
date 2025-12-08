import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react';
import api from '../lib/api';
import CategorySettings from '../components/CategorySettings';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState(null);
    const { settings, updateSetting } = useSettings();

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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your application preferences and data</p>
            </div>

            <CategorySettings />

            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <RefreshCcw size={20} className="text-brand-500" />
                    Sync Settings
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Auto-Sync</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Automatically sync changes when online</p>
                    </div>
                    <button
                        onClick={() => updateSetting('autoSync', !settings.autoSync)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${settings.autoSync ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                    >
                        <span
                            className={`${settings.autoSync ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform`}
                        />
                    </button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <Card hover className="p-6 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Download size={80} className="text-brand-500" />
                    </div>

                    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Download size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Export Data</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium">
                        Download all your expenses as a CSV file for backup or analysis in other tools.
                    </p>
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        fullWidth
                        className="group-hover:bg-brand-50 dark:group-hover:bg-brand-900/10 group-hover:border-brand-200 dark:group-hover:border-brand-500/30"
                    >
                        <Download size={18} className="mr-2" />
                        Download CSV
                    </Button>
                </Card>

                {/* Import Section */}
                <Card hover className="p-6 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Upload size={80} className="text-emerald-500" />
                    </div>

                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Upload size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Import Data</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium">
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
                        <Button
                            variant="secondary"
                            fullWidth
                            disabled={importing}
                            isLoading={importing}
                        >
                            <Upload size={18} className="mr-2" />
                            {importing ? 'Importing...' : 'Upload CSV'}
                        </Button>
                    </div>
                </Card>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 shadow-sm font-medium",
                    message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20'
                )}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
}
