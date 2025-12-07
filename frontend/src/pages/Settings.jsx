import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import CategorySettings from '../components/CategorySettings';

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
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
                <p className="text-slate-500">Manage your application data</p>
            </div>

            <CategorySettings />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4">
                        <Download size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Export Data</h3>
                    <p className="text-slate-500 mb-6 text-sm">
                        Download all your expenses as a CSV file for backup or analysis in other tools.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Download CSV
                    </button>
                </div>

                {/* Import Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <Upload size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Import Data</h3>
                    <p className="text-slate-500 mb-6 text-sm">
                        Upload a CSV file to bulk import expenses. Duplicate handling depends on your data.
                    </p>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImport}
                            disabled={importing}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <button
                            disabled={importing}
                            className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <Upload size={18} />
                            {importing ? 'Importing...' : 'Upload CSV'}
                        </button>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}
        </div>
    );
}
