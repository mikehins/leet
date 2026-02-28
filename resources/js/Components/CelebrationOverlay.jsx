import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy } from 'lucide-react';

const COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function CelebrationOverlay({ type, duration = 2, sound, onComplete }) {
    const containerRef = useRef(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const run = async () => {
            if (sound) {
                try {
                    const audio = new Audio(sound);
                    await audio.play();
                } catch {
                    // Sound playback failed (user may have blocked it)
                }
            }

            switch (type) {
                case 'confetti-explosion':
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
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
                    break;

                case 'sparkling-stars':
                    for (let i = 0; i < 6; i++) {
                        setTimeout(() => {
                            confetti({
                                particleCount: 3,
                                startVelocity: 20,
                                spread: 360,
                                ticks: 40,
                                origin: { x: 0.5, y: 0.5 },
                                colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
                                shapes: ['star'],
                            });
                        }, i * 120);
                    }
                    break;

                case 'trophy-spin':
                    confetti({
                        particleCount: 30,
                        spread: 100,
                        origin: { y: 0.5 },
                        colors: ['#fbbf24', '#f59e0b'],
                    });
                    break;

                case 'fireworks-mini':
                    confetti({
                        particleCount: 100,
                        spread: 100,
                        origin: { y: 0.7 },
                        colors: COLORS,
                        shapes: ['circle', 'square'],
                    });
                    setTimeout(() => {
                        confetti({
                            particleCount: 60,
                            angle: 60,
                            spread: 55,
                            origin: { x: 0.3, y: 0.8 },
                            colors: COLORS,
                        });
                        confetti({
                            particleCount: 60,
                            angle: 120,
                            spread: 55,
                            origin: { x: 0.7, y: 0.8 },
                            colors: COLORS,
                        });
                    }, 200);
                    break;

                case 'rainbow-swipe':
                    confetti({
                        particleCount: 120,
                        spread: 180,
                        origin: { y: 0.5 },
                        colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
                        startVelocity: 25,
                    });
                    break;

                default:
                    confetti({
                        particleCount: 60,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: COLORS,
                    });
            }

            const ms = (duration || 2) * 1000;
            const t = setTimeout(() => {
                setVisible(false);
                onComplete?.();
            }, ms);
            return () => clearTimeout(t);
        };

        run();
    }, [type, duration, sound, onComplete]);

    if (!visible) return null;

    return (
        <div
            ref={containerRef}
            className="pointer-events-none fixed inset-0 z-50"
            aria-hidden="true"
        >
            {/* Sparkling stars overlay (for sparkling-stars type) */}
            {type === 'sparkling-stars' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                        <Star
                            key={i}
                            className="absolute h-10 w-10 animate-ping fill-amber-400 text-amber-400"
                            style={{
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.8s',
                                left: `${30 + (i % 4) * 15}%`,
                                top: `${25 + Math.floor(i / 4) * 25}%`,
                            }}
                            strokeWidth={1.5}
                        />
                    ))}
                </div>
            )}

            {/* Trophy spin overlay */}
            {type === 'trophy-spin' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy
                        className="h-32 w-32 text-amber-500"
                        style={{
                            animation: 'trophyLand 1.2s ease-out forwards',
                        }}
                        strokeWidth={1.5}
                    />
                </div>
            )}

            {/* Rainbow swipe - CSS gradient sweep */}
            {type === 'rainbow-swipe' && (
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.3), rgba(249,115,22,0.3), rgba(234,179,8,0.3), rgba(34,197,94,0.3), rgba(59,130,246,0.3), rgba(139,92,246,0.3), rgba(236,72,153,0.3), transparent)',
                        animation: 'rainbowSwipe 1.5s ease-out forwards',
                    }}
                />
            )}
        </div>
    );
}
