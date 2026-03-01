import { useEffect, useState } from 'react';

export default function XpPopup({ points, onComplete }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, 1200);
        return () => clearTimeout(t);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div
            className="pointer-events-none fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 animate-xp-float"
            aria-hidden="true"
        >
            <span className="inline-flex items-center gap-1 rounded-2xl border-2 border-amber-300 bg-amber-50 px-6 py-3 text-2xl font-bold text-amber-800 shadow-lg">
                +{points} XP
            </span>
        </div>
    );
}
