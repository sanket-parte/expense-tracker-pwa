import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import InstallPrompt from './components/InstallPrompt';
import NotFound from './pages/NotFound';
import Loading from './components/Loading';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Expenses = React.lazy(() => import('./pages/Expenses'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Budgets = React.lazy(() => import('./pages/Budgets'));
const Recurring = React.lazy(() => import('./pages/Recurring'));

import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Router>
              <InstallPrompt />
              <React.Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/budgets" element={<Budgets />} />
                      <Route path="/recurring" element={<Recurring />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
            </Router>
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
