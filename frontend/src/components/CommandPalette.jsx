import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Receipt, Wallet, Calendar, Settings, Moon, Sun, Monitor, ArrowRight, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function CommandPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    // Internal keyboard handling for closing and navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Static actions
    const items = [
        { id: 'dashboard', label: 'Go to Dashboard', icon: Home, action: () => navigate('/dashboard'), type: 'Navigation' },
        { id: 'expenses', label: 'Go to Expenses', icon: Receipt, action: () => navigate('/expenses'), type: 'Navigation' },
        { id: 'budgets', label: 'Go to Budgets', icon: Wallet, action: () => navigate('/budgets'), type: 'Navigation' },
        { id: 'calendar', label: 'Go to Calendar', icon: Calendar, action: () => navigate('/calendar'), type: 'Navigation' },
        { id: 'settings', label: 'Go to Settings', icon: Settings, action: () => navigate('/settings'), type: 'Navigation' },
        { id: 'theme-light', label: 'Switch to Light Mode', icon: Sun, action: () => setTheme('light'), type: 'Theme' },
        { id: 'theme-dark', label: 'Switch to Dark Mode', icon: Moon, action: () => setTheme('dark'), type: 'Theme' },
    ];

    // Filtered items
    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    // Add "Search in Expenses" if query exists and doesn't exactly match an item
    if (query.length > 1) {
        filteredItems.push({
            id: 'search-expenses',
            label: `Search expenses for "${query}"`,
            icon: Search,
            action: () => navigate(`/expenses?search=${encodeURIComponent(query)}`),
            type: 'Search'
        });
    }

    const handleSelect = (item) => {
        item.action();
        setQuery('');
        onClose();
    };

    // Keyboard navigation within list
    useEffect(() => {
        const handleListNav = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[activeIndex]) {
                    handleSelect(filteredItems[activeIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleListNav);
        return () => window.removeEventListener('keydown', handleListNav);
    }, [isOpen, activeIndex, filteredItems]);

    // Reset index when query changes
    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/20 dark:bg-slate-950/50 backdrop-blur-sm z-[9999]"
                    />

                    {/* Modal Container - Flex centering */}
                    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-xl pointer-events-auto"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[60vh]">
                                {/* Input */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <Search className="w-5 h-5 text-slate-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Type a command or search..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
                                    />
                                    <div className="flex items-center gap-1">
                                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 font-mono">
                                            ESC
                                        </kbd>
                                    </div>
                                </div>

                                {/* List */}
                                <div className="overflow-y-auto p-2">
                                    {filteredItems.length === 0 ? (
                                        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                            No results found.
                                        </div>
                                    ) : (
                                        <ul className="space-y-1">
                                            {filteredItems.map((item, index) => (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => handleSelect(item)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors",
                                                            index === activeIndex
                                                                ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className={cn(
                                                                "w-5 h-5",
                                                                index === activeIndex ? "text-brand-600 dark:text-brand-400" : "text-slate-400"
                                                            )} />
                                                            <span className="font-medium">{item.label}</span>
                                                        </div>
                                                        {index === activeIndex && item.type === 'Search' && (
                                                            <ArrowRight className="w-4 h-4 opacity-50" />
                                                        )}
                                                        {item.type !== 'Search' && (
                                                            <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">
                                                                {item.type}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center justify-end gap-4 text-xs text-slate-400 dark:text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">↑↓</span> to navigate
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">↵</span> to select
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
