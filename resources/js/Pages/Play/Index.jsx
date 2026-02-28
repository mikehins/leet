import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CelebrationOverlay from '@/Components/CelebrationOverlay';
import ThinkingCanvas from '@/Components/ThinkingCanvas';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, router } from '@inertiajs/react';
import { Check, X, Star } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function PlayIndex({ game, problem, progress, grade: initialGrade = 'grade_4' }) {
    const t = useTranslations();
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hint, setHint] = useState(null);
    const [hintLoading, setHintLoading] = useState(false);
    const [explanation, setExplanation] = useState(null);
    const [explanationLoading, setExplanationLoading] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const inputRef = useRef(null);
    const startTime = useRef(Date.now());

    const xpPerCorrect = game?.xp_per_correct ?? 50;
    const correctAnimations = game?.rewards?.correct_animations ?? [
        { type: 'confetti-explosion', duration: 2.5 },
    ];
    const [celebrationAnimation, setCelebrationAnimation] = useState(null);
    const [displayXp, setDisplayXp] = useState(progress.xp ?? progress.total_points ?? 0);

    useEffect(() => {
        inputRef.current?.focus();
    }, [problem.id]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - startTime.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [problem.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading || !answer.trim()) return;

        setLoading(true);
        axios
            .post(route('play.submit'), {
                problem_id: problem.id,
                answer: answer.trim(),
                time_spent_seconds: timeSpent,
            })
            .then(({ data }) => {
                setFeedback(data);
                if (data.new_total_points != null) setDisplayXp(data.new_total_points);
                if (data.correct && correctAnimations.length > 0) {
                    const chosen = correctAnimations[Math.floor(Math.random() * correctAnimations.length)];
                    setCelebrationAnimation(chosen);
                }
            })
            .catch(() => setFeedback({ correct: false, correct_answer: '?' }))
            .finally(() => setLoading(false));
    };

    const handleNext = () => {
        setAnswer('');
        setFeedback(null);
        setHint(null);
        setExplanation(null);
        setCelebrationAnimation(null);
        setTimeSpent(0);
        startTime.current = Date.now();
        router.reload({ preserveState: false });
    };

    const handleGetHint = () => {
        if (hintLoading || !feedback) return;
        setHintLoading(true);
        setHint(null);
        axios
            .post(route('play.hint'), {
                problem_id: problem.id,
                user_answer: answer,
                correct_answer: feedback.correct_answer,
            })
            .then(({ data }) => setHint(data.hint))
            .catch((err) => setHint(err.response?.data?.message || t('play.hint_error')))
            .finally(() => setHintLoading(false));
    };

    const handleExplain = () => {
        if (explanationLoading || !feedback) return;
        setExplanationLoading(true);
        setExplanation(null);
        axios
            .post(route('play.explain'), {
                problem_id: problem.id,
                correct_answer: feedback.correct_answer,
            })
            .then(({ data }) => setExplanation(data.explanation || []))
            .catch((err) => setExplanation([err.response?.data?.message || t('play.explain_error')]))
            .finally(() => setExplanationLoading(false));
    };

    const topicLabel = t(`topics.${problem.type}`);
    const difficultyColor = {
        easy: 'bg-emerald-100 text-emerald-800',
        medium: 'bg-amber-100 text-amber-800',
        hard: 'bg-rose-100 text-rose-800',
    }[problem.difficulty] ?? 'bg-gray-100 text-gray-800';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                        {t('game.name')}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={initialGrade}
                            onChange={(e) => router.visit(route(route().current(), { grade: e.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
                        >
                            {['grade_3', 'grade_4', 'grade_5', 'grade_6'].map((g) => (
                                <option key={g} value={g}>
                                    {t(`grade.${g}`)}
                                </option>
                            ))}
                        </select>
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                            {displayXp} XP
                        </span>
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                            {t('dashboard.level')} {progress.level}
                        </span>
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                            {progress.current_streak} {t('play.day_streak')}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`${t('nav.play')} - ${t('game.name')}`} />

            {celebrationAnimation && feedback?.correct && (
                <CelebrationOverlay
                    type={celebrationAnimation.type}
                    duration={celebrationAnimation.duration}
                    sound={celebrationAnimation.sound}
                />
            )}

            <div className="min-h-[60vh] bg-slate-50/50 py-8">
                <div className="mx-auto max-w-xl px-4">
                    {!feedback ? (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            {/* Card header */}
                            <div className="border-b border-slate-100 bg-slate-800 px-8 py-5">
                                <div className="flex items-center justify-between">
                                    <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${difficultyColor}`}>
                                        {t(`grade.${initialGrade}`)}
                                    </span>
                                    <span className="text-sm font-medium text-white/90">{topicLabel}</span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-white/80">
                                    {t('play.solve_equation')}
                                </p>
                            </div>

                            {/* Problem area */}
                            <div className="p-10">
                                <div className="mb-6">
                                    <p className="mb-2 text-sm font-semibold text-slate-600">
                                        {t('play.work_here')}
                                    </p>
                                    <ThinkingCanvas
                                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                                        problemKey={problem.id}
                                        equation={
                                            problem.stacked
                                                ? { stacked: problem.stacked }
                                                : { question: problem.question_text }
                                        }
                                    />
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="answer" className="mb-2 block text-sm font-semibold text-slate-600">
                                            {t('play.your_answer')}
                                        </label>
                                        <input
                                            ref={inputRef}
                                            id="answer"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="?"
                                            className="block w-full rounded-xl border border-slate-300 bg-white px-6 py-5 text-2xl font-semibold text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !answer.trim()}
                                        className="w-full rounded-xl bg-slate-800 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        {loading ? t('play.checking') : t('play.check_answer')}
                                    </button>
                                </form>

                                <p className="mt-4 text-center text-sm font-medium text-slate-500">
                                    {timeSpent}s
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            <div className="p-10 text-center">
                                {feedback.correct ? (
                                    <>
                                        <div className="mb-4 flex justify-center">
                                            <Check className="h-20 w-20 text-emerald-600" strokeWidth={2} />
                                        </div>
                                        <h2 className="mb-2 text-2xl font-bold text-emerald-600">
                                            {feedback.combo_count >= 3 ? t('play.combo') : feedback.speed_bonus ? t('play.lightning') : t('play.correct')}
                                        </h2>
                                        <div className="mb-4 flex flex-wrap justify-center gap-2">
                                            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-base font-semibold text-emerald-800">
                                                +{feedback.points_earned} XP
                                            </span>
                                            {feedback.speed_bonus > 0 && (
                                                <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
                                                    +{feedback.speed_bonus} speed
                                                </span>
                                            )}
                                            {feedback.combo_bonus > 0 && (
                                                <span className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800">
                                                    {feedback.combo_count} in a row +{feedback.combo_bonus}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mb-6 text-xl font-semibold text-slate-600">
                                            {t('play.xp_earned', { points: feedback.points_earned, total: feedback.new_total_points })}
                                        </p>
                                        <div className="mb-6 flex justify-center gap-1">
                                            {[1, 2, 3].map((i) => (
                                                <Star key={i} className="h-8 w-8 fill-amber-500 text-amber-500" strokeWidth={1.5} />
                                            ))}
                                        </div>
                                        {feedback.new_streak > 0 && (
                                            <p className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800">
                                                {feedback.new_streak} {t('play.day_streak_exclaim')}
                                            </p>
                                        )}
                                        <div className="mb-6">
                                            <button
                                                type="button"
                                                onClick={handleExplain}
                                                disabled={explanationLoading}
                                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                            >
                                                {explanationLoading ? t('play.thinking') : t('play.how_does_it_work')}
                                            </button>
                                            {explanation && explanation.length > 0 && (
                                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                                                    <p className="mb-2 font-medium text-slate-800">{t('play.heres_how')}</p>
                                                    <ol className="list-inside list-decimal space-y-2 text-slate-700">
                                                        {explanation.map((step, i) => (
                                                            <li key={i}>{step}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4 flex justify-center">
                                            <X className="h-20 w-20 text-amber-500" strokeWidth={2} />
                                        </div>
                                        <h2 className="mb-2 text-2xl font-bold text-amber-600">
                                            {t('play.almost')}
                                        </h2>
                                        <p className="mb-2 text-xl text-slate-600">
                                            {t('play.answer_was')} <strong className="text-slate-800">{feedback.correct_answer}</strong>
                                        </p>
                                        <p className="mb-4 text-slate-500">
                                            {t('play.no_worries')}
                                        </p>
                                        <div className="mb-4 flex justify-center gap-1">
                                            {[1, 2, 3].map((i) => (
                                                <Star key={i} className="h-8 w-8 fill-slate-300 text-slate-300" strokeWidth={1.5} />
                                            ))}
                                        </div>
                                        <div className="mb-6">
                                            <button
                                                type="button"
                                                onClick={handleGetHint}
                                                disabled={hintLoading}
                                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                            >
                                                {hintLoading ? t('play.thinking') : t('play.get_hint')}
                                            </button>
                                            {hint && (
                                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-slate-700">
                                                    <p className="font-medium text-amber-900">{t('play.hint')}</p>
                                                    <p className="mt-1">{hint}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="w-full rounded-xl bg-slate-800 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700"
                                >
                                    {t('play.next_problem')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
