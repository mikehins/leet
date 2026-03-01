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

    useEffect(() => {
        if (!problem || answered) return;
        const interval = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - startTime.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [problem?.id, answered]);

    useEffect(() => {
        if (!game?.code || !window.Echo) return;

        const channelName = `game.${game.code}`;
        const channel = window.Echo.channel(channelName);

        channel
            .listen('.game.started', (e) => {
                setGameState((prev) => ({ ...prev, players: e.players, status: 'active' }));
                setProblem(e.problems?.[me.id] ?? e.problem);
                setAnswered(false);
                setAnswer('');
                startTime.current = Date.now();
                setTimeSpent(0);
            })
            .listen('.round.started', (e) => {
                setGameState((prev) => ({ ...prev, current_round: e.roundNumber }));
                setProblem(e.problems?.[me.id] ?? e.problem);
                setAnswered(false);
                setAnswer('');
                startTime.current = Date.now();
                setTimeSpent(0);
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
        axios
            .post(route('compete.submit'), {
                game_code: game.code,
                problem_id: problem.id,
                answer: answer.trim(),
                time_spent_seconds: timeSpent,
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
                    setGameState((prev) => ({ ...prev, current_round: data.current_round }));
                    setProblem(data.problem);
                    setBonusFlash(null);
                    setAnswered(false);
                    setAnswer('');
                    startTime.current = Date.now();
                    setTimeSpent(0);
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
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                    {t('compete.title')} • {gameState.code}
                </h1>
            }
        >
            <Head title={`${t('compete.title')} - ${gameState.code}`} />

            <div className="min-h-[60vh] bg-slate-50/50 py-8">
                <div className="mx-auto max-w-xl px-4">
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
                    <div className="sticky top-14 z-40 -mx-4 mb-6 flex justify-center gap-2 bg-slate-50/95 px-4 py-2 backdrop-blur-sm sm:gap-4 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                        {gameState.players?.map((p) => (
                            <div
                                key={p.user_id ?? p.id ?? p.name}
                                className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border px-3 py-2 sm:flex-col sm:items-center sm:justify-center sm:gap-0 sm:px-6 sm:py-3 ${
                                    (p.user_id ?? p.id) === me.id
                                        ? 'border-slate-300 bg-white shadow-sm'
                                        : 'border-slate-200 bg-slate-50'
                                }`}
                            >
                                <p className="truncate text-xs font-bold text-slate-600 sm:text-sm">
                                    {(p.user_id ?? p.id) === me.id ? t('compete.you') : p.name}
                                    {p.grade && (
                                        <span className="ml-1 hidden font-normal text-slate-500 sm:inline">
                                            ({t(`grade.${p.grade}`)})
                                        </span>
                                    )}
                                </p>
                                <p className="shrink-0 text-xl font-extrabold tabular-nums text-slate-800 sm:text-2xl">
                                    {p.score}
                                </p>
                            </div>
                        ))}
                    </div>

                    {isWaiting && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                            <p className="mb-4 text-base font-medium text-slate-600">
                                {t('compete.waiting')}
                            </p>
                            <p className="mb-2 text-sm text-slate-500">{t('compete.share_code')}</p>
                            <p className="mb-4 font-mono text-3xl font-bold tracking-[0.4em] text-slate-800">
                                {gameState.code}
                            </p>
                            <a
                                href={`${route('compete.join')}?code=${gameState.code}`}
                                className="text-sm font-medium text-slate-600 underline hover:text-slate-800"
                            >
                                {t('compete.join_with_code')}
                            </a>
                        </div>
                    )}

                    {isActive && problem && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 bg-slate-800 px-8 py-4">
                                <p className="text-base font-semibold text-white">
                                    {t('compete.round', {
                                        current: gameState.current_round,
                                        total: gameState.total_rounds,
                                    })}
                                </p>
                            </div>
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
                                        <div className="relative">
                                        <input
                                            ref={inputRef}
                                            id="answer"
                                            type="text"
                                            inputMode="numeric"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="?"
                                            className="block w-full rounded-xl border border-slate-300 px-6 py-5 text-2xl font-semibold text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                            disabled={loading || answered}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-sm font-medium tabular-nums text-slate-600">
                                            ⏱ {timeSpent}s
                                        </span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !answer.trim() || answered}
                                        className="w-full rounded-xl bg-slate-800 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        {loading ? t('play.checking') : answered ? t('play.submitted') : t('play.check_answer')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {isFinished && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
                            <div className="mb-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    {isTie ? (
                                        <Minus className="h-16 w-16 text-slate-600" strokeWidth={2} />
                                    ) : winnerId === me.id ? (
                                        <Trophy className="h-16 w-16 text-amber-500" strokeWidth={1.5} />
                                    ) : (
                                        <Trophy className="h-16 w-16 text-slate-300" strokeWidth={1.5} />
                                    )}
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-800">
                                    {isTie
                                        ? t('compete.tie')
                                        : winnerId === me.id
                                            ? t('compete.you_won')
                                            : t('compete.you_lost')}
                                </h2>
                            </div>

                            {results.length > 0 && (
                                <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-slate-700">{t('compete.question')}</th>
                                                {results[0]?.players.map((pl) => (
                                                    <th key={pl.user_id} colSpan={2} className="px-4 py-3 font-bold text-slate-700">
                                                        {pl.user_id === me.id ? t('compete.you') : pl.name}
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr className="bg-white text-xs text-slate-500">
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
                                                <tr key={row.round ?? rowIndex} className="border-t border-slate-100">
                                                    <td className="px-4 py-3 font-medium text-slate-700">{row.round}</td>
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
                                    className="rounded-xl bg-slate-800 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700"
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
