import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Receipt, Settings, PieChart, LogOut, UserCircle, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { to: "/", icon: Home, label: "Home" },
        { to: "/expenses", icon: Receipt, label: "Expenses" },
        { to: "/settings", icon: Settings, label: "Settings" },
        { to: "/profile", icon: UserCircle, label: "Profile" },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shadow-sm z-30">
                <div className="p-8 border-b border-slate-50">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                        PennyWise
                    </h1>
                </div>
                <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium group",
                                    isActive
                                        ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={22} className={isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"} />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-50">
                    <Link to="/profile" className="flex items-center gap-3 mb-4 p-3 -mx-2 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">
                            {user?.full_name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors truncate">{user?.full_name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pb-24 md:pb-8 relative">
                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                    <Outlet />
                </div>
            </main>

            {/* Modern Bottom Nav for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 pb-safe pt-2 flex justify-between items-center z-50 safe-area-bottom">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative",
                                isActive ? "text-brand-600" : "text-slate-400"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-brand-50 transform -translate-y-1" : ""
                                )}>
                                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium transition-all duration-300",
                                    isActive ? "opacity-100 font-semibold" : "opacity-70"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <span className="absolute -top-1 w-1 h-1 bg-brand-600 rounded-full" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
