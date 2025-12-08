import React, { useEffect, useState } from 'react';
import { useQueryClient, useMutationState, onlineManager } from '@tanstack/react-query';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

export default function SyncStatus() {
    const queryClient = useQueryClient();
    const { settings } = useSettings();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // mutationState will give us all variables
    const mutations = useMutationState({
        select: (mutation) => mutation.state,
    });

    const pendingMutations = mutations.filter(m => m.status === 'pending' && !m.isPaused);
    const pausedMutations = mutations.filter(m => m.isPaused);

    const isSyncing = pendingMutations.length > 0;
    const hasPendingChanges = pendingMutations.length > 0 || pausedMutations.length > 0;

    useEffect(() => {
        // When autoSync is disabled, we want to control "online" status manually
        // and ignore browser network events
        if (!settings.autoSync) {
            // Disable default event listeners (window.addEventListener)
            // by replacing the event listener setup with a no-op
            onlineManager.setEventListener(() => {
                return () => { };
            });
            // Force offline mode
            onlineManager.setOnline(false);
            setIsOnline(false);
        } else {
            // Restore default event listeners (window listeners)
            onlineManager.setEventListener((setOnline) => {
                const handleOnline = () => setOnline(true);
                const handleOffline = () => setOnline(false);
                window.addEventListener('online', handleOnline);
                window.addEventListener('offline', handleOffline);
                return () => {
                    window.removeEventListener('online', handleOnline);
                    window.removeEventListener('offline', handleOffline);
                };
            });
            // Re-sync with actual browser state
            onlineManager.setOnline(navigator.onLine);
            setIsOnline(navigator.onLine);

            if (navigator.onLine) {
                queryClient.resumePausedMutations();
            }
        }
    }, [settings.autoSync, queryClient]);

    // We don't need the second useEffect anymore as the onlineManager listener
    // handles the internal React Query state, and we can just sync our local state
    // with onlineManager or just trust the listener setup.
    // However, to keep the UI state `isOnline` in sync, we can listen to onlineManager.
    useEffect(() => {
        return onlineManager.subscribe((isOnline) => {
            setIsOnline(isOnline);
        });
    }, []);

    const handleSync = async () => {
        // Check actual browser connectivity
        if (!navigator.onLine) {
            return;
        }

        try {
            // Temporarily go online to sync
            onlineManager.setOnline(true);
            await queryClient.resumePausedMutations();

            // Wait a short delay to ensure mutations have started processing
            await new Promise(resolve => setTimeout(resolve, 100));

            // Wait for all mutations to settle with a 30s timeout
            const startTime = Date.now();
            const TIMEOUT_MS = 30000;

            while (queryClient.isMutating() > 0) {
                if (Date.now() - startTime > TIMEOUT_MS) {
                    console.warn('Sync timed out after 30s, cancelling pending mutations');

                    // Force cancel any stuck mutations
                    const mutationCache = queryClient.getMutationCache();
                    const pending = mutationCache.getAll().filter(m => m.state.status === 'pending');

                    for (const mutation of pending) {
                        try {
                            await mutation.cancel();
                        } catch (e) {
                            console.error('Failed to cancel mutation:', e);
                        }
                    }
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            await queryClient.invalidateQueries();
        } catch (error) {
            console.error('Sync process failed:', error);
        } finally {
            // Always return to offline mode if autoSync is disabled
            if (!settings.autoSync) {
                onlineManager.setOnline(false);
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <AnimatePresence mode='wait'>
                {hasPendingChanges ? (
                    <motion.button
                        key="syncing"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${isSyncing
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-wait'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 cursor-pointer'
                            }`}
                    >
                        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync Pending'}</span>
                        {hasPendingChanges && (
                            <span className="ml-1 text-xs bg-white/50 px-1.5 py-0.5 rounded-full">
                                {pausedMutations.length + pendingMutations.length}
                            </span>
                        )}
                    </motion.button>
                ) : !isOnline ? (
                    <motion.div
                        key="offline"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium"
                    >
                        <WifiOff size={16} />
                        <span>Offline</span>
                    </motion.div>
                ) : (
                    <motion.button
                        key="online"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleSync}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                        <Wifi size={16} />
                        <span>{settings.autoSync ? 'Synced' : 'Synced (Manual)'}</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
