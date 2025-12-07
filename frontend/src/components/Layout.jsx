import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Receipt, Settings, PieChart, LogOut, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
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
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        PennyWise
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                    isActive
                                        ? "bg-violet-50 text-violet-700 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )
                            }
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="pt-6 border-t border-slate-100 p-4">
                    <Link to="/profile" className="flex items-center gap-3 mb-4 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center">
                            <UserCircle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 group-hover:text-violet-700 transition-colors truncate">{user?.full_name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 md:pb-8">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 safe-area-bottom">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                                isActive ? "text-violet-600" : "text-slate-400"
                            )
                        }
                    >
                        <item.icon size={24} />
                        <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
