import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        // Check if running in standalone mode (already installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        if (isIosDevice && !isStandalone) {
            setTimeout(() => setIsIOS(true), 0);
            // Give users a moment before showing the prompt on iOS
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        // Android / Chrome
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleClose = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 lg:bottom-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm mx-auto relative overflow-hidden">
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <img src="/pwa-192x192.png" alt="App Icon" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Install App</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isIOS ? 'Install for a better experience' : 'Add to Home Screen for quick access'}
                            </p>
                        </div>
                    </div>

                    {isIOS ? (
                        <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="flex items-center gap-2 mb-2">
                                1. Tap the <Share size={16} className="text-blue-500" /> Share button
                            </p>
                            <p className="flex items-center gap-2">
                                2. Select <PlusSquare size={16} className="text-gray-500 dark:text-gray-400" /> Add to Home Screen
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors active:scale-95 transform"
                        >
                            Install Application
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
