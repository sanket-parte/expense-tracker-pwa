import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
            <div className="p-6 bg-white shadow-xl rounded-2xl max-w-sm w-full border border-slate-100">
                <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
                <p className="text-slate-600 mb-6 text-sm">
                    {error.message || 'An unexpected error occurred.'}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-95"
                >
                    Try again
                </button>
            </div>
        </div>
    );
};

export default ErrorFallback;
