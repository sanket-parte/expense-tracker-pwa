import { Toaster as Sonner } from 'sonner';

export default function Toaster() {
    return (
        <Sonner
            theme="system"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-950 dark:group-[.toaster]:text-slate-50 group-[.toaster]:border-slate-200 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-glass-md',
                    description: 'group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400',
                    actionButton: 'group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50 dark:group-[.toast]:bg-slate-50 dark:group-[.toast]:text-slate-900',
                    cancelButton: 'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-400',
                    success: 'group-[.toaster]:!border-emerald-500/20 group-[.toaster]:!bg-emerald-50/50 dark:group-[.toaster]:!bg-emerald-900/10',
                    error: 'group-[.toaster]:!border-red-500/20 group-[.toaster]:!bg-red-50/50 dark:group-[.toaster]:!bg-red-900/10',
                    info: 'group-[.toaster]:!border-blue-500/20 group-[.toaster]:!bg-blue-50/50 dark:group-[.toaster]:!bg-blue-900/10',
                },
            }}
        />
    );
}
