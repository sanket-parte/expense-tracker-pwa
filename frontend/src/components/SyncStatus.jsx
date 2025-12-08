import React, { useEffect, useState } from 'react';
import { useQueryClient, useIsMutating, useMutationState, onlineManager } from '@tanstack/react-query';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

export default function SyncStatus() {
    const queryClient = useQueryClient();
    const isMutating = useIsMutating();
    const { settings } = useSettings();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // mutationState will give us pending mutations
    const pendingMutations = useMutationState({
        filters: { status: 'pending' },
        select: (mutation) => mutation.state,
    });

    // Also check for paused mutations which happens when offline
    const pausedMutations = useMutationState({
        filters: { status: 'paused' },
        select: (mutation) => mutation.state,
    });

    const hasPendingChanges = pendingMutations.length > 0 || pausedMutations.length > 0;

    useEffect(() => {
        // When autoSync is disabled, we force "offline" mode for React Query
        // unless we are explicitly syncing.
        if (!settings.autoSync) {
            onlineManager.setOnline(false);
        } else {
            // Revert to default behavior (window listeners)
            onlineManager.setOnline(navigator.onLine);
            if (navigator.onLine) {
                queryClient.resumePausedMutations();
            }
        }
    }, [settings.autoSync, queryClient]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (settings.autoSync) {
                onlineManager.setOnline(true);
                queryClient.resumePausedMutations();
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
            onlineManager.setOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [queryClient, settings.autoSync]);

    const handleSync = async () => {
        if (!isOnline) {
            // If really offline, do nothing
            return;
        }

        // Temporarily go online to sync
        onlineManager.setOnline(true);
        await queryClient.resumePausedMutations();
        await queryClient.invalidateQueries();

        // If autoSync is off, go back to "offline" mode after sync
        if (!settings.autoSync) {
            // We wait a bit to ensure everything is settled if needed, 
            // but resumePausedMutations should handle the queue.
            // Ideally we shouldn't flip back immediately if there are still things processing,
            // but resumePausedMutations awaits the current paused mutations.
            onlineManager.setOnline(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <AnimatePresence mode='wait'>
                {!isOnline ? (
                    <motion.div
                        key="offline"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium"
                    >
                        <WifiOff size={16} />
                        <span>Offline</span>
                        {hasPendingChanges && (
                            <span className="ml-1 text-xs bg-red-200 dark:bg-red-800 px-1.5 py-0.5 rounded-full">
                                {pausedMutations.length} pending
                            </span>
                        )}
                    </motion.div>
                ) : (
                    hasPendingChanges ? (
                        <motion.button
                            key="syncing"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleSync}
                            disabled={isMutating > 0}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${isMutating > 0
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-wait'
                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 cursor-pointer'
                                }`}
                        >
                            <RefreshCw size={16} className={isMutating > 0 ? "animate-spin" : ""} />
                            <span>{isMutating > 0 ? 'Syncing...' : 'Sync Pending'}</span>
                            {hasPendingChanges && (
                                <span className="ml-1 text-xs bg-white/50 px-1.5 py-0.5 rounded-full">
                                    {pausedMutations.length + pendingMutations.length}
                                </span>
                            )}
                        </motion.button>
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
                    )
                )}
            </AnimatePresence>
        </div>
    );
}
