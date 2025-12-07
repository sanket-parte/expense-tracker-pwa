// ... (imports remain)
import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Receipt, Settings, PieChart, LogOut, UserCircle, Plus, Wallet, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { to: "/", icon: Home, label: "Home" },
        { to: "/expenses", icon: Receipt, label: "Expenses" },
        { to: "/budgets", icon: Wallet, label: "Budgets" },
        { to: "/recurring", icon: RefreshCcw, label: "Recurring" },
        { to: "/settings", icon: Settings, label: "Settings" },
        { to: "/profile", icon: UserCircle, label: "Profile" },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900">
            {/* Desktop Sidebar - Enhanced */}
            <aside className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 h-screen sticky top-0 shadow-lg z-30 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-gradient-to-b from-brand-50/50 to-transparent" />

                <div className="p-8 border-b border-slate-100/50 relative z-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-lg shadow-brand-500/30">P</span>
                        PennyWise
                    </h1>
                </div>

                <nav className="flex-1 p-6 space-y-2 relative z-10">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium group relative overflow-hidden",
                                    isActive
                                        ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100/50"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-600 rounded-r-full" />}
                                    <item.icon size={22} className={cn("transition-all duration-300", isActive ? "text-brand-600 scale-110" : "text-slate-400 group-hover:text-slate-600")} />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100/50 relative z-10">
                    <Link to="/profile" className="flex items-center gap-3 mb-4 p-3 -mx-2 rounded-2xl hover:bg-white/60 transition-all group border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-indigo-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ring-2 ring-white">
                            {user?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 group-hover:text-brand-700 transition-colors truncate">{user?.full_name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium hover:shadow-sm"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-slate-50/50 relative">
                {/* Background Decorative Blobs */}
                <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-brand-50/40 to-transparent pointer-events-none z-0" />
                <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-200/20 rounded-full blur-3xl pointer-events-none z-0" />
                <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none z-0" />

                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative z-10 pb-32 md:pb-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation - Glassmorphism Dock */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 h-[72px] glass rounded-2xl flex justify-between items-center px-2 shadow-2xl shadow-brand-900/10 z-50 safe-area-bottom ring-1 ring-white/50">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-1 flex-col items-center justify-center gap-1 h-full relative group",
                                isActive ? "text-brand-600" : "text-slate-400"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "relative p-2 rounded-xl transition-all duration-300 ease-out",
                                    isActive ? "bg-brand-50/80 -translate-y-6 shadow-lg shadow-brand-500/20 ring-4 ring-white" : "group-active:scale-95"
                                )}>
                                    <item.icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn("transition-transform duration-300", isActive && "scale-110")}
                                    />
                                </div>

                                <span className={cn(
                                    "absolute bottom-2 text-[10px] font-bold tracking-wide transition-all duration-300",
                                    isActive ? "opacity-100 translate-y-0 text-brand-700" : "opacity-0 translate-y-2 pointer-events-none"
                                )}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <span className="absolute -bottom-[-18px] left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-400 rounded-full opacity-50" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
