import { useCallback } from 'react';

const useHaptics = () => {
    const vibrate = useCallback((pattern = 10) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }, []);

    const success = useCallback(() => vibrate([10, 30, 10]), [vibrate]);
    const error = useCallback(() => vibrate([50, 30, 50]), [vibrate]);
    const light = useCallback(() => vibrate(5), [vibrate]);
    const medium = useCallback(() => vibrate(10), [vibrate]);
    const heavy = useCallback(() => vibrate(15), [vibrate]);

    return { vibrate, success, error, light, medium, heavy };
};

export default useHaptics;
