import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, Link } from '@inertiajs/react';
import { Award, Brain, Dices, Swords, Plus, Minus, X, Divide } from 'lucide-react';

export default function Dashboard({ game, progress, stats, recentAttempts }) {
    const t = useTranslations();
    const rewardTiers = game?.reward_tiers ?? {};
    const currentXp = progress.xp ?? progress.total_points;
    const nextTier = Object.entries(rewardTiers).find(([, v]) => v.xp > currentXp);
    const progressToNext = nextTier
        ? Math.min(100, (currentXp / nextTier[1].xp) * 100)
        : 100;

    const topicCards = [
        { href: route('badges.index'), labelKey: 'nav.badges', Icon: Award, badgeCount: stats?.badges_earned },
        { href: route('think.index'), labelKey: 'think.title', Icon: Brain },
        { href: route('play', { grade: 'grade_4' }), labelKey: 'topics.random', Icon: Dices },
        { href: route('compete.index'), labelKey: 'compete.title', Icon: Swords },
        { href: route('play.addition', { grade: 'grade_4' }), labelKey: 'topics.addition', Icon: Plus },
        { href: route('play.subtraction', { grade: 'grade_4' }), labelKey: 'topics.subtraction', Icon: Minus },
        { href: route('play.multiplication', { grade: 'grade_4' }), labelKey: 'topics.multiplication', Icon: X },
        { href: route('play.division', { grade: 'grade_4' }), labelKey: 'topics.division', Icon: Divide },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                    {t('game.name')}
                </h1>
            }
        >
            <Head title={t('dashboard.title')} />

            <div className="min-h-screen bg-slate-50/50 py-8">
                <div className="mx-auto max-w-5xl px-4">
                    {/* Stats cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('dashboard.level')}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{progress.level}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('dashboard.total_xp')}</p>
                            <p className="mt-2 text-3xl font-bold text-amber-600">{currentXp} XP</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('dashboard.streak')}</p>
                            <p className="mt-2 text-3xl font-bold text-orange-600">{progress.current_streak}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('dashboard.accuracy')}</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.accuracy}%</p>
                        </div>
                    </div>

                    {/* Progress to next tier */}
                    {nextTier && (
                        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">
                                    {t('dashboard.progress_to', { tier: t(`game.${nextTier[0]}`), xp: nextTier[1].xp })}
                                </span>
                                <span className="text-sm font-medium text-slate-500">
                                    {currentXp} / {nextTier[1].xp} XP
                                </span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-slate-700 transition-all duration-500"
                                    style={{ width: `${progressToNext}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Play buttons */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('dashboard.choose_topic')}</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {topicCards.map((card) => {
                                const Icon = card.Icon;
                                return (
                                    <Link
                                        key={card.href}
                                        href={card.href}
                                        className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                    >
                                        <Icon className="mb-3 h-10 w-10 text-slate-600 group-hover:text-slate-800" strokeWidth={1.5} />
                                        <span className="text-base font-semibold text-slate-700 group-hover:text-slate-900">
                                            {t(card.labelKey)}
                                        </span>
                                        {card.badgeCount != null && (
                                            <span className="mt-1 text-sm text-slate-500">
                                                {card.badgeCount} / {stats?.badges_total ?? 14}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent attempts */}
                    {recentAttempts.length > 0 && (
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('dashboard.recent_attempts')}</h2>
                            <ul className="space-y-3">
                                {recentAttempts.map((attempt) => (
                                    <li
                                        key={attempt.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                                    >
                                        <span className="font-medium text-slate-700">{attempt.question}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500">{t('dashboard.your_answer')} {attempt.answer}</span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-bold ${
                                                    attempt.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {attempt.correct ? t('dashboard.correct') : t('dashboard.try_again')}
                                            </span>
                                            <span className="text-sm text-slate-400">{attempt.created_at}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
