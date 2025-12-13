import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, ArrowRight, CheckCircle, XCircle, Flame, Plus } from 'lucide-react';
import api from '../lib/api';
import Card from './ui/Card';
import Button from './ui/Button';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export default function ChallengesWidget() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchChallenges = async () => {
        try {
            const { data } = await api.get('/challenges');
            setChallenges(data);
            // Also trigger a background check to update progress
            api.post('/challenges/check').catch(console.error);
        } catch (error) {
            console.error("Failed to fetch challenges", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post('/challenges/generate');
            await fetchChallenges();
        } catch (error) {
            console.error("Failed to generate", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.post(`/challenges/${id}/accept`);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            await fetchChallenges();
        } catch (error) {
            console.error("Failed to accept", error);
        }
    };

    if (loading) return null;

    const activeChallenges = challenges.filter(c => c.status === 'active');
    const pendingChallenges = challenges.filter(c => c.status === 'pending');
    const completedChallenges = challenges.filter(c => c.status === 'completed');

    // If no active or pending challenges, show empty state or completed summary
    if (activeChallenges.length === 0 && pendingChallenges.length === 0 && completedChallenges.length === 0) {
        return (
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Trophy className="animate-bounce" /> Spend-Less Challenge
                        </h3>
                        <p className="text-orange-100 max-w-md">
                            Gamify your savings! Let AI create personalized weekly targets to help you save more.
                        </p>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        isLoading={generating}
                        className="bg-white text-orange-600 hover:bg-orange-50 border-none shadow-lg font-bold px-6 py-3"
                    >
                        Start Challenge
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Target className="text-orange-500" /> Active Challenges
                </h3>
                {activeChallenges.length === 0 && pendingChallenges.length > 0 && (
                    <span className="text-sm text-slate-500">Select a challenge below</span>
                )}
            </div>

            {/* Active Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {activeChallenges.map(challenge => (
                    <motion.div
                        layout
                        key={challenge.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden"
                    >
                        {/* Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 h-1 bg-slate-100 dark:bg-slate-800 w-full">
                            <motion.div
                                className={cn("h-full",
                                    (challenge.current_amount / challenge.target_amount) > 1 ? "bg-red-500" : "bg-green-500"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((challenge.current_amount / challenge.target_amount) * 100, 100)}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{challenge.title}</h4>
                                <p className="text-xs text-slate-500 font-medium">{challenge.description}</p>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-xl">
                                <Flame size={20} />
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Current Spend</p>
                                <p className={cn("text-2xl font-extrabold",
                                    challenge.current_amount > challenge.target_amount ? "text-red-500" : "text-slate-800 dark:text-white"
                                )}>
                                    ₹{challenge.current_amount.toFixed(0)} <span className="text-sm text-slate-400 font-medium">/ ₹{challenge.target_amount}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                <p className={cn("text-sm font-bold flex items-center gap-1",
                                    challenge.current_amount > challenge.target_amount ? "text-red-500" : "text-green-500"
                                )}>
                                    {challenge.current_amount > challenge.target_amount ? 'Over Budget' : 'On Track'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pending Proposals */}
            {pendingChallenges.length > 0 && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">New Proposals</h4>
                        <Button size="sm" variant="ghost" onClick={() => setChallenges(prev => prev.filter(c => c.status !== 'pending'))}>Has't Now</Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {pendingChallenges.map(challenge => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={challenge.id}
                                className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
                            >
                                <div className="mb-4">
                                    <div className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wide">{challenge.category_id ? 'Category Goal' : 'General'}</div>
                                    <h5 className="font-bold text-slate-900 dark:text-white mb-1">{challenge.title}</h5>
                                    <p className="text-xs text-slate-500">{challenge.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Target: ₹{challenge.target_amount}</span>
                                    <Button size="sm" onClick={() => handleAccept(challenge.id)}>Accept</Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
