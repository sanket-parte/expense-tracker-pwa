import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Fetch config
                const configRes = await api.get('/auth/config');
                setRegistrationEnabled(configRes.data.enable_registration);

                // Load user if token exists
                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                }
            } catch (error) {
                console.error("Auth init failed", error);
                if (token) logout();
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const res = await api.post('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const newToken = res.data.access_token;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Fetch user profile immediately
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
    };

    const register = async (email, password, fullName) => {
        await api.post('/auth/register', { email, password, full_name: fullName });
        // Automatically login after register
        await login(email, password);
    };



    const updateProfile = async (data) => {
        const res = await api.put('/auth/me', data);
        setUser(res.data);
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading, isAuthenticated: !!user, registrationEnabled }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
