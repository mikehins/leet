import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

const COLORS = ['#e07a5f', '#81b29a', '#f2cc8f', '#f59e0b', '#10b981'];

export default function LevelUpOverlay({ level, onComplete }) {
    const t = useTranslations();

    useEffect(() => {
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.5 },
            colors: COLORS,
        });
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: COLORS,
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: COLORS,
        });
    }, [level]);

    const handleContinue = () => {
        onComplete?.();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-up-title"
        >
            <div className="flex flex-col items-center gap-6 rounded-3xl border-4 border-amber-400 bg-amber-50 px-12 py-8 shadow-2xl">
                <Trophy
                    className="h-24 w-24 text-amber-500"
                    style={{ animation: 'trophyLand 1s ease-out forwards' }}
                    strokeWidth={1.5}
                />
                <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-amber-600">
                        Level Up!
                    </p>
                    <p id="level-up-title" className="text-5xl font-bold text-amber-800">Level {level}</p>
                </div>
                <button
                    type="button"
                    onClick={handleContinue}
                    className="rounded-xl border-2 border-coral bg-coral px-8 py-3 text-lg font-semibold text-white transition hover:bg-coral-hover"
                >
                    {t('level_up.continue')}
                </button>
            </div>
        </div>
    );
}
