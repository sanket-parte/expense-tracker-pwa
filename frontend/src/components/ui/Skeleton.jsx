import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden relative",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 -translate-x-full animate-shimmer shimmer-gradient" />
        </div>
    );
}

export { Skeleton };
