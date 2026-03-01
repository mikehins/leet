import { useCompetitionChannel } from '@/Contexts/CompetitionChannelContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, Link, router } from '@inertiajs/react';
import { Target, Plus, Minus, X, Divide } from 'lucide-react';
import { useState } from 'react';

const TOPIC_ICONS = { addition: Plus, subtraction: Minus, multiplication: X, division: Divide };

export default function CompeteIndex({ game, suggestedPractice, requireSuggestedPractice, canPlay = true }) {
    const t = useTranslations();
    const { onlineCount } = useCompetitionChannel();
    const [grade, setGrade] = useState('grade_4');
    const [mode, setMode] = useState('regular');
    const [timeLimit, setTimeLimit] = useState(25);

    const createGame = () => {
        router.post(route('compete.create'), {
            grade,
            mode,
            time_limit_seconds: mode === 'countdown' ? timeLimit : null,
        }, { preserveState: false });
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="font-display text-2xl font-bold tracking-tight text-stone-800">
                    {t('compete.title')}
                </h1>
            }
        >
            <Head title={t('compete.title')} />

            <div className="min-h-screen bg-cream py-12">
                <div className="mx-auto max-w-md px-4">
                    {suggestedPractice && requireSuggestedPractice && !canPlay && (
                        <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                            <p className="mb-2 flex items-center gap-2 font-semibold text-amber-800">
                                <Target className="h-5 w-5" strokeWidth={2} />
                                {t('report_card.practice_first')}
                            </p>
                            <p className="mb-3 text-sm text-amber-700">
                                {t('report_card.practice_first_hint')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedPractice.items.map((item) => {
                                    const Icon = TOPIC_ICONS[item.topic];
                                    return (
                                        <Link
                                            key={item.topic}
                                            href={route(`play.${item.topic}`, { grade: 'grade_4' })}
                                            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                                        >
                                            {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
                                            {t(`topics.${item.topic}`)}: {item.correct_count}/{item.target_count}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {suggestedPractice && canPlay && (
                        <div className="mb-6 rounded-lg border border-sage/40 bg-sage-light px-4 py-3">
                            <p className="text-sm font-medium text-sage">
                                {t('report_card.suggested_practice_optional')}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {suggestedPractice.items.map((item) => {
                                    const Icon = TOPIC_ICONS[item.topic];
                                    return (
                                        <Link
                                            key={item.topic}
                                            href={route(`play.${item.topic}`, { grade: 'grade_4' })}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-sage/60 bg-white px-3 py-1.5 text-xs font-medium text-sage transition hover:bg-sage/20"
                                        >
                                            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
                                            {t(`topics.${item.topic}`)} {item.correct_count}/{item.target_count}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <p className="mb-8 text-center text-stone-600">
                        {t('compete.subtitle')}
                    </p>

                    {onlineCount > 0 && (
                        <p className="mb-6 text-center text-sm font-medium text-stone-500">
                            {t('compete.online_count', { count: onlineCount })}
                        </p>
                    )}

                    <div className="mb-6">
                        <label htmlFor="grade" className="mb-2 block text-sm font-medium text-stone-700">
                            {t('think.grade_label')}
                        </label>
                        <select
                            id="grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="block w-full rounded-lg border border-warm bg-white px-4 py-3 text-stone-800 focus:border-stone-500 focus:ring-2 focus:ring-warm"
                        >
                            {['grade_3', 'grade_4', 'grade_5', 'grade_6'].map((g) => (
                                <option key={g} value={g}>
                                    {t(`grade.${g}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-stone-700">
                            {t('compete.mode')}
                        </label>
                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-warm bg-white px-4 py-3 transition hover:border-stone-300 hover:bg-warm">
                                <input
                                    type="radio"
                                    name="mode"
                                    value="regular"
                                    checked={mode === 'regular'}
                                    onChange={() => setMode('regular')}
                                    className="h-4 w-4 border-warm text-stone-800"
                                />
                                <span className="font-medium text-stone-700">{t('compete.mode_regular')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-warm bg-white px-4 py-3 transition hover:border-stone-300 hover:bg-warm">
                                <input
                                    type="radio"
                                    name="mode"
                                    value="countdown"
                                    checked={mode === 'countdown'}
                                    onChange={() => setMode('countdown')}
                                    className="h-4 w-4 border-warm text-stone-800"
                                />
                                <span className="font-medium text-stone-700">{t('compete.mode_countdown')}</span>
                                {mode === 'countdown' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={5}
                                            max={120}
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(Math.max(5, Math.min(120, parseInt(e.target.value, 10) || 25)))}
                                            className="w-16 rounded-lg border border-warm px-2 py-1 text-center text-stone-800"
                                        />
                                        <span className="text-sm text-stone-500">{t('compete.seconds_per_question')}</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={createGame}
                            disabled={!canPlay}
                            className="w-full rounded-lg bg-coral px-8 py-5 text-base font-medium text-white transition hover:bg-coral-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t('compete.create_game')}
                        </button>

                        <a
                            href={route('compete.join')}
                            className="block w-full rounded-lg border border-warm bg-white px-8 py-5 text-center text-base font-medium text-stone-700 transition hover:bg-warm"
                        >
                            {t('compete.join_game')}
                        </a>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
