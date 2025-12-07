import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
            <div className="max-w-md w-full">
                <h1 className="text-6xl font-black text-indigo-600 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
                <p className="text-slate-600 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all active:scale-95"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
