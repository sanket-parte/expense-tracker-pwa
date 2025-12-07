// ... (imports remain)
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Settings, LogOut, Menu, X, UserCircle, Wallet, RefreshCcw, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function Layout() {
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { to: "/", icon: Home, label: "Home" },
        { to: "/expenses", icon: Receipt, label: "Expenses" },
        { to: "/budgets", icon: Wallet, label: "Budgets" },
        { to: "/recurring", icon: RefreshCcw, label: "Recurring" },
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

    return (
        <div className="flex min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 px-2 mb-8">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
                            Flow
                        </span>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <item.icon size={22} className="transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={22} strokeWidth={2} />
                        Sign Out
                    </button>

                    <div className="flex items-center gap-3 px-2 pt-2">
                        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.full_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header - Update bg and border */}
            <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">Flow</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu - Update bg/text */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 pt-16 bg-slate-50 dark:bg-slate-950">
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium transition-colors",
                                    isActive
                                        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800"
                                )}
                            >
                                <item.icon size={24} />
                                {item.label}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 mt-8"
                        >
                            <LogOut size={24} />
                            Sign Out
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area - Update bg */}
            <main className={cn(
                "flex-1 min-w-0 transition-all duration-300 lg:pl-72",
                location.pathname === '/' ? "p-4 pb-24 lg:p-8" : "p-4 pb-24 lg:p-8"
            )}>
                <div className="pt-16 lg:pt-0 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav - Update bg/border */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 safe-area-bottom">
                <div className="flex justify-around items-center p-2">
                    {navItems.slice(0, 4).map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                                isActive
                                    ? "text-brand-600 dark:text-brand-400"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                            isActive
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Settings size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">Settings</span>
                            </>
                        )}
                    </NavLink>
                </div>
            </nav>
        </div>
    );
}
