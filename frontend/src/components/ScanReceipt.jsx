import React, { useState, useRef } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import api from '../lib/api';
// eslint-disable-next-line no-unused-vars
import { cn } from '../lib/utils';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function ScanReceipt({ onParse }) {
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/ai/scan-receipt', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.parsed) {
                onParse(data.parsed);
            }
        } catch (error) {
            console.error('Error scanning receipt:', error);
            alert('Failed to scan receipt. Please try again.');
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
            />

            <AnimatePresence mode="wait">
                {isScanning ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-brand-600 text-white p-3 rounded-full shadow-lg flex items-center gap-2 pr-4 disabled cursor-wait"
                    >
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm font-semibold whitespace-nowrap">Scanning...</span>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerFileInput}
                        className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white p-3 rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center group"
                        title="Scan Receipt"
                    >
                        <Camera size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
