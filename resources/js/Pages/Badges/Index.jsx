import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head } from '@inertiajs/react';
import confetti from 'canvas-confetti';
import {
    Award,
    Bolt,
    Brain,
    Crown,
    Divide,
    Flame,
    Lock,
    Medal,
    MessageCircle,
    Minus,
    Plus,
    Sparkles,
    Star,
    Target,
    Trophy,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const ICON_MAP = {
    Award,
    Bolt,
    Brain,
    Crown,
    Divide,
    Flame,
    Medal,
    MessageCircle,
    Minus,
    Plus,
    Sparkles,
    Star,
    Target,
    Trophy,
    X,
    Zap,
};

function formatEarnedDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function BadgesIndex({ game, badges, earned_count, total_count }) {
    const t = useTranslations();
    const [selectedBadge, setSelectedBadge] = useState(null);

    const handleEarnedBadgeClick = (badge) => {
        if (!badge.earned) return;
        confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#a7f3d0', '#fbbf24', '#f59e0b'],
        });
        setSelectedBadge(badge);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('badges.title')}</h1>
                    <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                        {earned_count} / {total_count} {t('badges.earned')}
                    </span>
                </div>
            }
        >
            <Head title={t('badges.title')} />

            <div className="min-h-[60vh] bg-slate-50/50 py-8">
                <div className="mx-auto max-w-4xl px-4">
                    <p className="mb-8 text-center text-slate-600">{t('badges.subtitle')}</p>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {badges.map((badge) => {
                            const IconComponent = ICON_MAP[badge.icon] || Award;
                            const earned = badge.earned;

                            return (
                                <button
                                    key={badge.id}
                                    type="button"
                                    onClick={() => handleEarnedBadgeClick(badge)}
                                    disabled={!earned}
                                    className={`flex w-full flex-col items-center rounded-2xl border p-6 shadow-sm transition text-left ${
                                        earned
                                            ? 'cursor-pointer border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-md'
                                            : 'cursor-default border-slate-200 bg-slate-50/80'
                                    }`}
                                >
                                    <div
                                        className={`relative mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                                            earned
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-slate-200 text-slate-400'
                                        }`}
                                    >
                                        <IconComponent className="h-8 w-8" strokeWidth={2} />
                                        {!earned && (
                                            <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-slate-500 p-1">
                                                <Lock className="h-3 w-3 text-white" strokeWidth={2.5} />
                                            </span>
                                        )}
                                    </div>
                                    <h3
                                        className={`mb-1 text-center font-semibold ${
                                            earned ? 'text-slate-800' : 'text-slate-500'
                                        }`}
                                    >
                                        {t(badge.name_key)}
                                    </h3>
                                    <p
                                        className={`text-center text-sm ${
                                            earned ? 'text-slate-600' : 'text-slate-400'
                                        }`}
                                    >
                                        {t(badge.description_key)}
                                    </p>
                                    {earned && (
                                        <span className="mt-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-700">
                                            {t('badges.unlocked')}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedBadge && (() => {
                const DialogIcon = ICON_MAP[selectedBadge.icon] || Award;
                return (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                    onClick={() => setSelectedBadge(null)}
                >
                    <div
                        className="relative max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedBadge(null)}
                            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label={t('profile.cancel')}
                        >
                            <X className="h-5 w-5" strokeWidth={2} />
                        </button>
                        <div className="flex flex-col items-center pt-2">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                                <DialogIcon className="h-10 w-10 text-emerald-600" strokeWidth={2} />
                            </div>
                            <h3 className="mb-1 text-center text-lg font-bold text-slate-800">
                                {t(selectedBadge.name_key)}
                            </h3>
                            <p className="mb-4 text-center text-sm text-slate-600">
                                {t(selectedBadge.description_key)}
                            </p>
                            <p className="text-center text-sm font-medium text-emerald-700">
                                {t('badges.earned_on')}
                            </p>
                            <p className="text-center text-sm text-slate-600">
                                {formatEarnedDate(selectedBadge.earned_at)}
                            </p>
                        </div>
                    </div>
                </div>
                );
            })()}
        </AuthenticatedLayout>
    );
}
