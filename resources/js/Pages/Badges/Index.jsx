import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head } from '@inertiajs/react';
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

export default function BadgesIndex({ game, badges, earned_count, total_count }) {
    const t = useTranslations();

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
                                <div
                                    key={badge.id}
                                    className={`flex flex-col items-center rounded-2xl border p-6 shadow-sm transition ${
                                        earned
                                            ? 'border-emerald-200 bg-white'
                                            : 'border-slate-200 bg-slate-50/80'
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
