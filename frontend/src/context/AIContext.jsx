import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
    const [isAIEnabled, setIsAIEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAIStatus = async () => {
        try {
            const { data } = await api.get('/ai/settings');
            setIsAIEnabled(data.is_set);
        } catch (error) {
            console.error("Failed to check AI status:", error);
            setIsAIEnabled(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAIStatus();
    }, []);

    const refreshAIConfig = async () => {
        setLoading(true);
        await checkAIStatus();
    };

    return (
        <AIContext.Provider value={{ isAIEnabled, loading, refreshAIConfig }}>
            {children}
        </AIContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};
