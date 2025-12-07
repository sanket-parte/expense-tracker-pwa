import React, { useState } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, updateProfile, logout } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const data = { full_name: fullName };
            if (password) {
                data.password = password;
            }
            await updateProfile(data);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Profile</h2>
                <p className="text-slate-500">Manage your account information</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address
                        </label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                            <User size={20} />
                            <span>{user?.email}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Email address cannot be changed</p>
                    </div>

                    {/* Full Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                            required
                        />
                    </div>

                    {/* Password Section */}
                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-violet-600" />
                            Change Password
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    placeholder="Leave blank to keep current password"
                                    minLength={6}
                                />
                            </div>
                            {password && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                        placeholder="Confirm new password"
                                        required={!!password}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70"
                        >
                            <Save size={20} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-6 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all"
                >
                    <LogOut size={20} />
                    Log Out
                </button>
            </div>
        </div>
    );
}
