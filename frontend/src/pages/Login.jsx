import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Wallet } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageTransition from '../components/ui/PageTransition';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);

            const from = location.state?.from?.pathname || '/';
            const search = location.state?.from?.search || '';
            navigate(`${from}${search}`, { replace: true });
        } catch {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950">
            {/* Left Decorative Side - Hidden on Mobile */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-900 items-center justify-center p-12">
                <div className="absolute inset-0 bg-mesh-dark opacity-80" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7f1c338e852c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 shadow-neon border border-white/20">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                            Master your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-300">
                                financial flow
                            </span>
                        </h1>
                        <p className="text-brand-100 text-lg leading-relaxed">
                            Experience the future of expense tracking.
                            Smart insights, beautiful analytics, and complete control over your money.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Background Elements */}
                <div className="absolute inset-0 lg:hidden bg-mesh-light dark:bg-mesh-dark pointer-events-none" />

                <div className="w-full max-w-md space-y-8 relative z-10 sm:bg-white/50 sm:dark:bg-slate-900/50 sm:backdrop-blur-xl sm:p-10 sm:rounded-3xl sm:border sm:border-white/20 sm:shadow-2xl">
                    <div className="text-center">
                        <div className="lg:hidden w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to continue to Flow</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100 dark:border-red-500/20"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            type="email"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={loading}
                            className="text-lg group"
                        >
                            <span className="mr-2">Sign In</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            {useAuth().registrationEnabled ? (
                                <>
                                    Don't have an account?{' '}
                                    <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                                        Create account
                                    </Link>
                                </>
                            ) : (
                                "Registration is currently disabled"
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

