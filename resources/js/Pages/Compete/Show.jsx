import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ThinkingCanvas from '@/Components/ThinkingCanvas';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, router } from '@inertiajs/react';
import { Trophy, Minus } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function CompeteShow({ game, problem: initialProblem, results: initialResults = [], me }) {
    const t = useTranslations();
    const [gameState, setGameState] = useState(game);
    const [problem, setProblem] = useState(initialProblem);
    const [results, setResults] = useState(initialResults);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [bonusFlash, setBonusFlash] = useState(null);
    const inputRef = useRef(null);
    const startTime = useRef(Date.now());

    useEffect(() => {
        inputRef.current?.focus();
    }, [problem?.id]);

    const isCountdown = gameState.mode === 'countdown';
    const roundEndsAt = gameState.round_ends_at;

    useEffect(() => {
        if (!problem || answered) return;
        if (isCountdown && roundEndsAt) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((new Date(roundEndsAt) - Date.now()) / 1000));
                setTimeSpent(remaining);
            }, 100);
            return () => clearInterval(interval);
        }
        const interval = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - startTime.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [problem?.id, answered, isCountdown, roundEndsAt]);

    useEffect(() => {
        if (!isCountdown || !problem || answered || loading) return;
        if (timeSpent <= 0) {
            setAnswered(true);
            setLoading(true);
            axios
                .post(route('compete.timeout'), {
                    game_code: game.code,
                    problem_id: problem.id,
                })
                .then(({ data }) => {
                    if (data.scores) {
                        setGameState((prev) => ({ ...prev, players: data.scores }));
                    }
                    if (data.round_advanced && data.problem) {
                        setGameState((prev) => ({
                            ...prev,
                            current_round: data.current_round,
                            round_ends_at: data.round_ends_at,
                        }));
                        setProblem(data.problem);
                        setAnswered(false);
                        setAnswer('');
                        startTime.current = Date.now();
                        setTimeSpent(isCountdown && data.round_ends_at
                            ? Math.ceil((new Date(data.round_ends_at) - Date.now()) / 1000)
                            : 0);
                    }
                    if (data.game_ended) {
                        setGameState((prev) => ({
                            ...prev,
                            status: 'finished',
                            players: data.final_scores,
                        }));
                        setProblem(null);
                        setResults(data.results || []);
                    }
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [timeSpent, isCountdown, problem, answered, loading, gameState.code]);

    useEffect(() => {
        if (!game?.code || !window.Echo) return;

        const channelName = `game.${game.code}`;
        const channel = window.Echo.channel(channelName);

        channel
            .listen('.game.started', (e) => {
                setGameState((prev) => ({
                    ...prev,
                    players: e.players,
                    status: 'active',
                    round_ends_at: e.game?.round_ends_at ?? prev.round_ends_at,
                }));
                setProblem(e.problems?.[me.id] ?? e.problem);
                setAnswered(false);
                setAnswer('');
                startTime.current = Date.now();
                setTimeSpent(e.game?.round_ends_at ? Math.ceil((new Date(e.game.round_ends_at) - Date.now()) / 1000) : 0);
            })
            .listen('.round.started', (e) => {
                setGameState((prev) => ({
                    ...prev,
                    current_round: e.roundNumber,
                    round_ends_at: e.roundEndsAt ?? prev.round_ends_at,
                }));
                setProblem(e.problems?.[me.id] ?? e.problem);
                setAnswered(false);
                setAnswer('');
                startTime.current = Date.now();
                setTimeSpent(e.roundEndsAt ? Math.ceil((new Date(e.roundEndsAt) - Date.now()) / 1000) : 0);
            })
            .listen('.player.answered', (e) => {
                setGameState((prev) => ({ ...prev, players: e.scores }));
            })
            .listen('.game.ended', (e) => {
                setGameState((prev) => ({
                    ...prev,
                    status: 'finished',
                    players: e.finalScores,
                }));
                setProblem(null);
                setResults(e.results || []);
            });

        return () => {
            channel.stopListening('.game.started');
            channel.stopListening('.round.started');
            channel.stopListening('.player.answered');
            channel.stopListening('.game.ended');
            window.Echo.leave(channelName);
        };
    }, [game?.code]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading || !answer.trim() || answered || !problem) return;

        setLoading(true);
        const timeSpentForSubmit = isCountdown
            ? (gameState.time_limit_seconds ?? 25) - timeSpent
            : timeSpent;
        axios
            .post(route('compete.submit'), {
                game_code: game.code,
                problem_id: problem.id,
                answer: answer.trim(),
                time_spent_seconds: timeSpentForSubmit,
            })
            .then(({ data }) => {
                setAnswered(true);
                if (data.scores) {
                    setGameState((prev) => ({ ...prev, players: data.scores }));
                }
                if (data.correct && (data.speed_bonus || data.first_bonus)) {
                    const labels = [];
                    if (data.speed_bonus) labels.push(`+${data.speed_bonus} ⚡ LIGHTNING`);
                    if (data.first_bonus) labels.push(`+${data.first_bonus} 🏃 FIRST!`);
                    setBonusFlash(labels);
                    setTimeout(() => setBonusFlash(null), 2500);
                }
                if (data.round_advanced && data.problem) {
                    setGameState((prev) => ({
                        ...prev,
                        current_round: data.current_round,
                        round_ends_at: data.round_ends_at ?? prev.round_ends_at,
                    }));
                    setProblem(data.problem);
                    setBonusFlash(null);
                    setAnswered(false);
                    setAnswer('');
                    startTime.current = Date.now();
                    setTimeSpent(isCountdown && data.round_ends_at
                        ? Math.max(0, Math.ceil((new Date(data.round_ends_at) - Date.now()) / 1000))
                        : 0);
                }
                if (data.game_ended) {
                    setGameState((prev) => ({
                        ...prev,
                        status: 'finished',
                        players: data.final_scores,
                    }));
                    setProblem(null);
                    setResults(data.results || []);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const handleNewGame = () => {
        router.visit(route('compete.index'));
    };

    const isWaiting = gameState.status === 'waiting';
    const isActive = gameState.status === 'active';
    const isFinished = gameState.status === 'finished';

    const winnerId = isFinished && gameState.players?.length === 2
        ? (gameState.players[0].score >= gameState.players[1].score
            ? (gameState.players[0].user_id ?? gameState.players[0].id)
            : (gameState.players[1].user_id ?? gameState.players[1].id))
        : null;
    const isTie = isFinished && gameState.players?.length === 2
        && gameState.players[0].score === gameState.players[1].score;

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-lg font-semibold text-stone-700 sm:text-xl">
                    {t('compete.title')} • {gameState.code}
                </h1>
            }
        >
            <Head title={`${t('compete.title')} - ${gameState.code}`} />

            <div className="min-h-[60vh]">
                <div className="mx-auto max-w-xl">
                    {/* Bonus flash */}
                    {bonusFlash && bonusFlash.length > 0 && (
                        <div className="mb-4 flex justify-center gap-2">
                            {bonusFlash.map((label, i) => (
                                <span
                                    key={i}
                                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Scoreboard - sticky on mobile so it stays visible while solving */}
                    <div className="sticky top-14 z-40 -mx-4 mb-6 flex justify-center gap-2 bg-cream/95 px-4 py-2 backdrop-blur-sm sm:gap-4 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                        {gameState.players?.map((p) => (
                            <div
                                key={p.user_id ?? p.id ?? p.name}
                                className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border px-3 py-2 sm:flex-col sm:items-center sm:justify-center sm:gap-0 sm:px-6 sm:py-3 ${
                                    (p.user_id ?? p.id) === me.id
                                        ? 'border-warm bg-white '
                                        : 'border-warm bg-warm/50'
                                }`}
                            >
                                <p className="truncate text-xs font-bold text-stone-600 sm:text-sm">
                                    {(p.user_id ?? p.id) === me.id ? t('compete.you') : p.name}
                                    {p.grade && (
                                        <span className="ml-1 hidden font-normal text-stone-500 sm:inline">
                                            ({t(`grade.${p.grade}`)})
                                        </span>
                                    )}
                                </p>
                                <p className="shrink-0 text-xl font-extrabold tabular-nums text-stone-800 sm:text-2xl">
                                    {p.score}
                                </p>
                            </div>
                        ))}
                    </div>

                    {isWaiting && (
                        <div className="rounded-xl border border-warm/60 bg-white p-6 text-center shadow-sm sm:p-10">
                            <p className="mb-4 text-base font-medium text-stone-600">
                                {t('compete.waiting')}
                            </p>
                            <p className="mb-2 text-sm text-stone-500">{t('compete.share_code')}</p>
                            <p className="mb-4 font-mono text-3xl font-bold tracking-[0.4em] text-stone-800">
                                {gameState.code}
                            </p>
                            <a
                                href={`${route('compete.join')}?code=${gameState.code}`}
                                className="text-sm font-medium text-stone-600 underline hover:text-stone-800"
                            >
                                {t('compete.join_with_code')}
                            </a>
                        </div>
                    )}

                    {isActive && problem && (
                        <div className="overflow-hidden rounded-xl border border-warm/60 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-warm/40 bg-stone-50/80 px-4 py-2.5 sm:px-6">
                                <p className="text-sm font-medium text-stone-700">
                                    {t('compete.round', {
                                        current: gameState.current_round,
                                        total: gameState.total_rounds,
                                    })}
                                </p>
                            </div>
                            <div className="p-4 sm:p-6 lg:p-8">
                                <div className="mb-4 sm:mb-6">
                                    <p className="mb-2 text-xs font-medium text-stone-500 sm:text-sm">
                                        {t('play.work_here')}
                                    </p>
                                    <ThinkingCanvas
                                        className="min-h-[120px] rounded-xl border border-warm/60 bg-stone-50/80 p-4 sm:min-h-[140px] sm:p-5"
                                        problemKey={problem.id}
                                        equation={
                                            problem.stacked
                                                ? { stacked: problem.stacked }
                                                : { question: problem.question_text }
                                        }
                                    />
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                                    <div>
                                        <label htmlFor="answer" className="mb-1.5 block text-sm font-medium text-stone-600">
                                            {t('play.your_answer')}
                                        </label>
                                        <div className="relative">
                                        <input
                                            ref={inputRef}
                                            id="answer"
                                            type="text"
                                            inputMode="numeric"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="?"
                                            className="block w-full rounded-xl border border-warm bg-white px-4 py-4 text-xl font-semibold text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-warm sm:px-6 sm:py-5 sm:text-2xl"
                                            disabled={loading || answered}
                                        />
                                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-1 font-mono text-xs font-medium tabular-nums sm:right-4 sm:px-3 sm:text-sm ${
                                            isCountdown && timeSpent <= 5
                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                : 'border-warm bg-warm text-stone-600'
                                        }`}>
                                            {isCountdown ? (
                                                <>{timeSpent}s {t('compete.left')}</>
                                            ) : (
                                                <>⏱ {timeSpent}s</>
                                            )}
                                        </span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !answer.trim() || answered}
                                        className="min-h-[48px] w-full rounded-xl border border-coral bg-coral px-6 py-3.5 text-base font-medium text-white transition hover:bg-coral-hover disabled:opacity-50 sm:min-h-[52px] sm:py-4"
                                    >
                                        {loading ? t('play.checking') : answered ? t('play.submitted') : t('play.check_answer')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {isFinished && (
                        <div className="rounded-xl border border-warm/60 bg-white p-6 shadow-sm sm:p-10">
                            <div className="mb-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    {isTie ? (
                                        <Minus className="h-16 w-16 text-stone-600" strokeWidth={2} />
                                    ) : winnerId === me.id ? (
                                        <Trophy className="h-16 w-16 text-amber-500" strokeWidth={1.5} />
                                    ) : (
                                        <Trophy className="h-16 w-16 text-stone-300" strokeWidth={1.5} />
                                    )}
                                </div>
                                <h2 className="text-3xl font-extrabold text-stone-800">
                                    {isTie
                                        ? t('compete.tie')
                                        : winnerId === me.id
                                            ? t('compete.you_won')
                                            : t('compete.you_lost')}
                                </h2>
                            </div>

                            {results.length > 0 && (
                                <div className="mb-6 overflow-hidden rounded-lg border border-warm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-warm">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-stone-700">{t('compete.question')}</th>
                                                {results[0]?.players.map((pl) => (
                                                    <th key={pl.user_id} colSpan={2} className="px-4 py-3 font-bold text-stone-700">
                                                        {pl.user_id === me.id ? t('compete.you') : pl.name}
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr className="bg-white text-xs text-stone-500">
                                                <th className="px-4 py-2"></th>
                                                {results[0]?.players.map((pl) => (
                                                    <React.Fragment key={pl.user_id}>
                                                        <th className="px-4 py-2">{t('compete.time')}</th>
                                                        <th className="px-4 py-2">{t('compete.points')}</th>
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((row, rowIndex) => (
                                                <tr key={row.round ?? rowIndex} className="border-t border-warm">
                                                    <td className="px-4 py-3 font-medium text-stone-700">{row.round}</td>
                                                    {row.players.map((pl) => (
                                                        <React.Fragment key={pl.user_id}>
                                                            <td className="px-4 py-3">
                                                                {pl.time != null ? `${pl.time}s` : '—'}
                                                            </td>
                                                            <td className="px-4 py-3">{pl.points}</td>
                                                        </React.Fragment>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    onClick={handleNewGame}
                                    className="min-h-[48px] rounded-xl border border-coral bg-coral px-6 py-3.5 text-base font-medium text-white transition hover:bg-coral-hover sm:min-h-[52px] sm:py-4"
                                >
                                    {t('compete.play_again')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
