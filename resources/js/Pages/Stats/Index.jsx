import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Brain,
    Clock,
    MessageCircle,
    Percent,
    Plus,
    Target,
    Trophy,
    X,
    Minus,
    Divide,
} from 'lucide-react';

const TOPIC_ICONS = {
    addition: Plus,
    subtraction: Minus,
    multiplication: X,
    division: Divide,
};

function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function StatsIndex({ game, progress, stats, byType, wordProblems }) {
    const t = useTranslations();

    const statCards = [
        { label: 'stats.total_attempts', value: stats.total_attempts, Icon: Target },
        { label: 'stats.correct_attempts', value: stats.correct_attempts, Icon: Trophy },
        { label: 'stats.accuracy', value: `${stats.accuracy}%`, Icon: Percent },
        { label: 'stats.total_time', value: formatTime(stats.total_time_seconds), Icon: Clock },
        { label: 'stats.avg_time', value: formatTime(stats.avg_time_seconds), Icon: Clock },
        { label: 'stats.fast_answers', value: stats.fast_answers, Icon: BarChart3 },
        { label: 'stats.badges', value: `${stats.badges_earned} / ${stats.badges_total}`, Icon: Trophy },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('stats.title')}</h1>
                </div>
            }
        >
            <Head title={t('stats.title')} />

            <div className="min-h-[60vh] bg-slate-50/50 py-8">
                <div className="mx-auto max-w-4xl px-4">
                    <p className="mb-8 text-center text-slate-600">{t('stats.subtitle')}</p>

                    {/* Overview */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map(({ label, value, Icon }) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                                    <span className="text-sm font-medium">{t(label)}</span>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Streaks */}
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('stats.streaks')}</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500">{t('stats.current_streak')}</p>
                                <p className="text-2xl font-bold text-orange-600">{progress.current_streak} {t('stats.days')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{t('stats.longest_streak')}</p>
                                <p className="text-2xl font-bold text-amber-600">{progress.longest_streak} {t('stats.days')}</p>
                            </div>
                        </div>
                    </div>

                    {/* By topic */}
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('stats.by_topic')}</h2>
                        <div className="space-y-4">
                            {Object.entries(byType).map(([type, data]) => {
                                const Icon = TOPIC_ICONS[type] || Target;
                                const acc = data.total > 0 ? Math.round(100 * data.correct / data.total) : 0;
                                return (
                                    <div
                                        key={type}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
                                            <span className="font-medium text-slate-800">{t(`topics.${type}`)}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-sm text-slate-600">
                                                {data.correct} / {data.total} {t('stats.correct')}
                                            </span>
                                            <span className="rounded-full bg-slate-200 px-3 py-0.5 text-sm font-medium text-slate-700">
                                                {acc}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Brain className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
                                    <span className="font-medium text-slate-800">{t('think.title')}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-sm text-slate-600">
                                        {wordProblems.correct} / {wordProblems.total} {t('stats.correct')}
                                    </span>
                                    <span className="rounded-full bg-slate-200 px-3 py-0.5 text-sm font-medium text-slate-700">
                                        {wordProblems.total > 0 ? Math.round(100 * wordProblems.correct / wordProblems.total) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('stats.ai_teacher')}</h2>
                        <div className="flex items-center gap-3">
                            <MessageCircle className="h-8 w-8 text-slate-600" strokeWidth={1.5} />
                            <div>
                                <p className="font-medium text-slate-800">{t('stats.questions_asked')}</p>
                                <p className="text-2xl font-bold text-slate-700">{progress.chat_questions_count}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
