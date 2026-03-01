import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, Link } from '@inertiajs/react';
import { Award, Brain, Dices, Swords, Plus, Minus, X, Divide, Users, Gift, Target, Zap, Flame } from 'lucide-react';

export default function Dashboard({ game, progress, stats, recentAttempts, friendActivities = [] }) {
    const t = useTranslations();
    const rewardTiers = game?.reward_tiers ?? {};
    const currentXp = progress.xp ?? progress.total_points;
    const nextTier = Object.entries(rewardTiers).find(([, v]) => v.xp > currentXp);
    const progressToNext = nextTier
        ? Math.min(100, (currentXp / nextTier[1].xp) * 100)
        : 100;

    const topicCards = [
        { href: route('badges.index'), labelKey: 'nav.badges', Icon: Award, badgeCount: stats?.badges_earned },
        { href: route('rewards.index'), labelKey: 'nav.rewards', Icon: Gift },
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
                <h1 className="text-lg font-semibold text-stone-700 sm:text-xl">
                    {t('game.name')}
                </h1>
            }
        >
            <Head title={t('dashboard.title')} />

            <div className="min-h-[60vh]">
                <div className="mx-auto flex max-w-7xl gap-4 sm:gap-6 lg:gap-8">
                    <div className="min-w-0 flex-1">
                    {/* Daily quest */}
                    {progress.problems_solved_today != null && !progress.daily_quest_completed && (
                        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-sage/40 bg-sage-light px-4 py-3 sm:rounded-xl sm:px-5 sm:py-4">
                            <div className="flex items-center gap-3">
                                <Target className="h-10 w-10 text-sage" strokeWidth={2} />
                                <div>
                                    <p className="font-semibold text-sage">
                                        {t('quest.daily')}
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        {t('quest.solve_n', { count: progress.daily_quest_target ?? 5 })}
                                        {' '}({progress.problems_solved_today}/{progress.daily_quest_target ?? 5})
                                    </p>
                                </div>
                            </div>
                            <div className="h-3 w-24 overflow-hidden rounded-full border border-sage bg-white">
                                <div
                                    className="h-full rounded-full bg-sage transition-all duration-500"
                                    style={{ width: `${Math.min(100, 100 * (progress.problems_solved_today / (progress.daily_quest_target ?? 5)))}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Streak reminder */}
                    {progress.current_streak >= 2 && progress.current_streak < 5 && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 sm:rounded-xl sm:px-5 sm:py-4">
                            <Flame className="h-10 w-10 text-orange-500" strokeWidth={2} />
                            <p className="font-semibold text-orange-800">
                                {t('dashboard.streak_reminder', { count: progress.current_streak })}
                            </p>
                        </div>
                    )}

                    {/* Stats cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                        {[
                            { key: 'level', value: progress.level, labelKey: 'dashboard.level', iconBg: 'bg-coral-light', iconColor: 'text-coral' },
                            { key: 'xp', value: `${currentXp} XP`, labelKey: 'dashboard.total_xp', iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
                            { key: 'streak', value: progress.current_streak, labelKey: 'dashboard.streak', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
                            { key: 'accuracy', value: `${stats.accuracy}%`, labelKey: 'dashboard.accuracy', iconBg: 'bg-sage-light', iconColor: 'text-sage' },
                        ].map((stat) => (
                            <div key={stat.key} className="group rounded-lg border border-warm bg-white p-6 transition-all duration-200 hover:border-stone-300">
                                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
                                    {stat.key === 'level' && <Award className="h-5 w-5" strokeWidth={2} />}
                                    {stat.key === 'xp' && <Zap className="h-5 w-5" strokeWidth={2} />}
                                    {stat.key === 'streak' && <Flame className="h-5 w-5" strokeWidth={2} />}
                                    {stat.key === 'accuracy' && <Target className="h-5 w-5" strokeWidth={2} />}
                                </div>
                                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{t(stat.labelKey)}</p>
                                <p className="mt-1 font-display text-2xl font-bold tracking-tight text-stone-800">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Progress to next tier */}
                    {nextTier && (
                        <div className="mb-8 rounded-lg border border-warm bg-white p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-stone-700">
                                    {t('dashboard.progress_to', { tier: t(`game.${nextTier[0]}`), xp: nextTier[1].xp })}
                                </span>
                                <span className="text-sm font-medium text-stone-500">
                                    {currentXp} / {nextTier[1].xp} XP
                                </span>
                            </div>
                            <div className="mt-4 h-2.5 overflow-hidden rounded-full border border-warm bg-warm">
                                <div
                                    className="h-full rounded-full bg-coral transition-all duration-500"
                                    style={{ width: `${progressToNext}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Play buttons */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-base font-semibold text-stone-700 sm:text-lg">{t('dashboard.choose_topic')}</h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                            {topicCards.map((card) => {
                                const Icon = card.Icon;
                                return (
                                    <Link
                                        key={card.href}
                                        href={card.href}
                                        className="group flex flex-col items-center justify-center rounded-lg border border-warm bg-white p-4 transition-all duration-200 hover:border-stone-300 sm:p-6 lg:p-8"
                                    >
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-coral bg-coral-light text-coral transition group-hover:border-sage group-hover:bg-sage-light group-hover:text-sage sm:mb-4 sm:h-14 sm:w-14">
                                            <Icon className="h-7 w-7" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm font-semibold text-stone-800 transition group-hover:text-stone-900">
                                            {t(card.labelKey)}
                                        </span>
                                        {card.badgeCount != null && (
                                            <span className="mt-1.5 text-xs text-stone-500">
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
                        <div className="rounded-lg border border-warm bg-white p-4 sm:p-6">
                            <h2 className="mb-5 font-display text-base font-semibold text-stone-800">{t('dashboard.recent_attempts')}</h2>
                            <ul className="space-y-2">
                                {recentAttempts.map((attempt) => (
                                    <li
                                        key={attempt.id}
                                        className="flex flex-col gap-2 rounded-lg border border-warm bg-warm/50 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                                    >
                                        <span className="min-w-0 font-medium text-stone-700">{attempt.question}</span>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span className="text-stone-500">{t('dashboard.your_answer')} {attempt.answer}</span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-bold ${
                                                    attempt.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {attempt.correct ? t('dashboard.correct') : t('dashboard.try_again')}
                                            </span>
                                            <span className="text-sm text-stone-400">{attempt.created_at}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                        {/* Friends activity - mobile (below main content) */}
                        <div className="mt-8 lg:hidden">
                            <div className="rounded-lg border border-warm bg-white p-6">
                                <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-800">
                                    <Users className="h-5 w-5 text-stone-500" strokeWidth={2} />
                                    {t('dashboard.friends_activity')}
                                </h2>
                                {friendActivities.length > 0 ? (
                                    <>
                                        <ul className="space-y-2">
                                            {friendActivities.slice(0, 5).map((activity) => (
                                                <li
                                                    key={`${activity.user_id}-${activity.badge_name_key}-${activity.earned_at}`}
                                                    className="rounded-lg border border-warm bg-warm/50 px-4 py-3 transition hover:bg-warm"
                                                >
                                                    <Link
                                                        href={route('stats.show', activity.user_id)}
                                                        className="flex min-w-0 items-center gap-3"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
                                                            <Award className="h-4 w-4 text-amber-700" strokeWidth={2} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm text-stone-700">
                                                                <span className="font-medium">{activity.user_name}</span>{' '}
                                                                {t('dashboard.friend_earned_badge')}{' '}
                                                                <span className="font-medium">{t(activity.badge_name_key) || activity.badge_name_key}</span>
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-stone-500">{activity.earned_at_human}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={route('friends.index')}
                                            className="mt-5 block text-center text-sm font-medium text-stone-600 transition hover:text-stone-900"
                                        >
                                            {t('dashboard.view_all_friends')} →
                                        </Link>
                                    </>
                                ) : (
                                    <p className="text-sm text-stone-500">{t('dashboard.no_friends_activity')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Friends activity sidebar - desktop */}
                    <aside className="hidden w-80 shrink-0 lg:block">
                        <div className="sticky top-14">
                            <div className="rounded-lg border border-warm bg-white p-6">
                                <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-800">
                                    <Users className="h-5 w-5 text-stone-500" strokeWidth={2} />
                                    {t('dashboard.friends_activity')}
                                </h2>
                                {friendActivities.length > 0 ? (
                                    <>
                                        <ul className="space-y-2">
                                            {friendActivities.map((activity) => (
                                                <li
                                                    key={`${activity.user_id}-${activity.badge_name_key}-${activity.earned_at}`}
                                                    className="rounded-lg border border-warm bg-warm/50 px-4 py-3 transition hover:bg-warm"
                                                >
                                                    <Link
                                                        href={route('stats.show', activity.user_id)}
                                                        className="flex min-w-0 items-center gap-3"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
                                                            <Award className="h-4 w-4 text-amber-700" strokeWidth={2} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm text-stone-700">
                                                                <span className="font-medium">{activity.user_name}</span>{' '}
                                                                {t('dashboard.friend_earned_badge')}{' '}
                                                                <span className="font-medium">{t(activity.badge_name_key) || activity.badge_name_key}</span>
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-stone-500">{activity.earned_at_human}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={route('friends.index')}
                                            className="mt-5 block text-center text-sm font-medium text-stone-600 transition hover:text-stone-900"
                                        >
                                            {t('dashboard.view_all_friends')} →
                                        </Link>
                                    </>
                                ) : (
                                    <p className="text-sm text-stone-500">{t('dashboard.no_friends_activity')}</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
