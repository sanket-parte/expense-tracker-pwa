import React, { useState } from 'react';
import AIChat from './AIChat';

import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Settings, LogOut, Menu, X, UserCircle, Wallet, RefreshCcw, Moon, Sun, Calendar, Search, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import SyncStatus from './SyncStatus';
import CommandPalette from './CommandPalette';

export default function Layout() {
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const navItems = [
        { to: "/dashboard", icon: Home, label: "Home" },
        { to: "/expenses", icon: Receipt, label: "Expenses" },
        { to: "/recurring", icon: RefreshCcw, label: "Recurring" },
        { to: "/budgets", icon: Wallet, label: "Budgets" },
        { to: "/reports", icon: BarChart2, label: "Reports" },
        { to: "/calendar", icon: Calendar, label: "Calendar" },
        { to: "/settings", icon: Settings, label: "Settings" },
        { to: "/profile", icon: UserCircle, label: "Profile" },
    ];

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Toggle with Cmd+K / Ctrl+K
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
            {/* Global Background Mesh */}
            <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none transition-opacity duration-500" />

            <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-r border-white/20 dark:border-white/5 z-50 shadow-glass-sm transition-all duration-300">
                <div className="flex-1 overflow-y-auto p-8 pb-4 scrollbar-hide">
                    <div className="flex items-center gap-3 px-2 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 text-white">
                            <Wallet size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
                                Flow
                            </span>
                            <div className="lg:block hidden opacity-80 scale-90 origin-left">
                                <SyncStatus />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border border-slate-200 dark:border-slate-800"
                    >
                        <Search size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Quick Search...</span>
                        <div className="ml-auto flex items-center gap-1">
                            <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-sans text-[10px] text-slate-500">⌘K</kbd>
                        </div>
                    </button>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-brand-600 shadow-md shadow-brand-500/25"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5"
                                )}
                            >
                                <item.icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", ({ isActive }) => isActive && "text-white")} strokeWidth={2} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/10 bg-white/30 dark:bg-white/5 space-y-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={18} strokeWidth={2} />
                        Sign Out
                    </button>

                    <div className="flex items-center gap-3 px-2 pt-2 mt-2 border-t border-dashed border-slate-200 dark:border-slate-700/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-100 to-accent-100 dark:from-brand-900/50 dark:to-accent-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-800 shadow-sm">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.full_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 z-40 px-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-md">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Flow</span>
                </div>
                <div className="flex items-center gap-3 scale-90">
                    <SyncStatus />
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full active:scale-95 transition-all"
                    >
                        <Search size={20} />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full active:scale-95 transition-all"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-100 to-accent-100 dark:from-brand-900/50 dark:to-accent-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-800"
                    >
                        {user?.full_name?.charAt(0) || 'U'}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 transition-all duration-300 lg:pl-72 flex flex-col h-[100dvh] overflow-hidden pt-16 lg:pt-0 relative z-0">
                <div className="flex-1 overflow-y-auto relative w-full scroll-smooth">
                    <div className={cn(
                        "max-w-7xl mx-auto w-full min-h-full",
                        location.pathname === '/' ? "p-4 pb-24 lg:p-8" : "p-4 pb-24 lg:p-8"
                    )}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="h-full"
                            >
                                <React.Suspense fallback={
                                    <div className="flex items-center justify-center h-[50vh]">
                                        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                                    </div>
                                }>
                                    <Outlet />
                                </React.Suspense>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-white/5 z-40 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center p-2.5">
                    {navItems.slice(0, 5).map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/dashboard'}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all relative active:scale-90 touch-manipulation min-w-[64px]",
                                isActive
                                    ? "text-brand-600 dark:text-brand-400"
                                    : "text-slate-400 dark:text-slate-500"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottomNav"
                                            className="absolute -top-3 w-10 h-1 bg-brand-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className={cn("transition-transform duration-300", isActive && "transform -translate-y-0.5")}>
                                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive && item.to === '/dashboard' ? "currentColor" : "none"} className={cn(isActive && "drop-shadow-sm")} />
                                    </div>
                                    <span className={cn("text-[10px] font-medium transition-opacity", isActive ? "opacity-100 font-bold" : "opacity-0 h-0 w-0 overflow-hidden")}>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => cn(
                            "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all relative active:scale-90 touch-manipulation min-w-[64px]",
                            isActive
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-slate-400 dark:text-slate-500"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNav"
                                        className="absolute -top-3 w-10 h-1 bg-brand-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={cn("transition-transform duration-300", isActive && "transform -translate-y-0.5")}>
                                    <Settings size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={cn("text-[10px] font-medium transition-opacity", isActive ? "opacity-100 font-bold" : "opacity-0 h-0 w-0 overflow-hidden")}>Settings</span>
                            </>
                        )}
                    </NavLink>
                </div>
            </nav>
            <AIChat />
        </div>
    );
}

