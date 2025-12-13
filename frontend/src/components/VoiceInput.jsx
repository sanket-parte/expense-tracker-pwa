import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInput = ({ onResult, onError }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported] = useState(
        ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)
    );
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // Stop after one sentence
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Default to Indian English given the context

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onResult) {
                onResult(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (onError) {
                onError(event.error);
            }
        };

        recognitionRef.current = recognition;
    }, [onResult, onError, isSupported]);

    const toggleListening = () => {
        if (!isSupported) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    if (!isSupported) return null;

    return (
        <div className="relative inline-block">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={`p-3 rounded-full transition-colors flex items-center justify-center ${isListening
                    ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
                    }`}
                title="Voice Quick Add"
            >
                {isListening ? (
                    <MicOffIcon className="w-5 h-5" />
                ) : (
                    <MicIcon className="w-5 h-5" />
                )}
            </motion.button>

            {/* Ripple Animation when listening */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ scale: 1, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full bg-red-500 -z-10"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Simple Icons
const MicIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

const MicOffIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
);

export default VoiceInput;
