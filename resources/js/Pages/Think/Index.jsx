import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ThinkingCanvas from '@/Components/ThinkingCanvas';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, usePage } from '@inertiajs/react';
import { Loader2, Mic, Send, Check, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ThinkIndex({ game, progress }) {
    const t = useTranslations();
    const { locale = 'en' } = usePage().props;
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [grade, setGrade] = useState('grade_4');
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [generateError, setGenerateError] = useState(null);
    const [chatXpEarned, setChatXpEarned] = useState(0);
    const [displayXp, setDisplayXp] = useState(progress.xp ?? progress.total_points ?? 0);
    const chatEndRef = useRef(null);
    const thinkChannelRef = useRef(null);
    const inputRef = useRef(null);

    const scrollChatToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        scrollChatToBottom();
    }, [messages]);

    useEffect(() => {
        return () => {
            if (thinkChannelRef.current) {
                window.Echo?.leave(thinkChannelRef.current);
            }
        };
    }, []);

    const generateProblem = () => {
        setGenerating(true);
        setGenerateError(null);
        setProblem(null);
        setFeedback(null);
        setAnswer('');
        setMessages([]);
        axios
            .post(route('think.generate'), { grade, locale })
            .then(({ data }) => {
                const token = data.token;
                const applyProblem = (problem) => {
                    setProblem(problem);
                    setGenerating(false);
                };

                if (window.Echo) {
                    const channelName = `think.${token}`;
                    thinkChannelRef.current = channelName;
                    const channel = window.Echo.channel(channelName);
                    channel.listen('.problem.ready', (e) => {
                        applyProblem(e.problem);
                        thinkChannelRef.current = null;
                        window.Echo.leave(channelName);
                    });
                    channel.error(() => {
                        setGenerateError(t('think.generate_error'));
                        setGenerating(false);
                        thinkChannelRef.current = null;
                        window.Echo.leave(channelName);
                    });
                } else {
                    const poll = () => {
                        axios
                            .get(route('think.result', { token }))
                            .then((res) => {
                                if (res.data.status === 'ready') {
                                    applyProblem(res.data.problem);
                                } else if (res.data.error) {
                                    setGenerateError(t('think.generate_error'));
                                    setGenerating(false);
                                } else {
                                    setTimeout(poll, 1500);
                                }
                            })
                            .catch(() => {
                                setGenerateError(t('think.generate_error'));
                                setGenerating(false);
                            });
                    };
                    poll();
                }
            })
            .catch(() => {
                setGenerateError(t('think.generate_error'));
                setGenerating(false);
            });
    };

    const sendChat = (text) => {
        if (!text.trim() || !problem || chatLoading) return;
        const userMsg = { role: 'user', content: text.trim() };
        setMessages((m) => [...m, userMsg]);
        setChatInput('');
        setChatLoading(true);

        const allMessages = [...messages, userMsg];

        axios
            .post(route('think.ask'), {
                problem_id: problem.id,
                messages: allMessages,
            })
            .then(({ data }) => {
                const assistantMsg = { role: 'assistant', content: data.reply };
                setMessages((m) => [...m, assistantMsg]);
                speak(data.reply);
                if (data.xp_earned) {
                    setDisplayXp((prev) => prev + data.xp_earned);
                    setChatXpEarned(data.xp_earned);
                    setTimeout(() => setChatXpEarned(0), 2500);
                }
            })
            .catch((err) => {
                const msg = err.response?.data?.message || t('think.chat_error');
                setMessages((m) => [...m, { role: 'assistant', content: msg }]);
            })
            .finally(() => setChatLoading(false));
    };

    const speak = (text) => {
        if (!text) return;
        setSpeaking(true);
        axios
            .post(route('think.speak'), { text, locale })
            .then(({ data }) => {
                const binary = atob(data.audio);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                const blob = new Blob([bytes], { type: data.mime_type || 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.onended = audio.onerror = () => {
                    URL.revokeObjectURL(url);
                    setSpeaking(false);
                };
                audio.play();
            })
            .catch(() => {
                if ('speechSynthesis' in window) {
                    const u = new SpeechSynthesisUtterance(text);
                    u.lang = locale.startsWith('fr') ? 'fr-FR' : 'en-US';
                    u.onend = u.onerror = () => setSpeaking(false);
                    window.speechSynthesis.speak(u);
                } else {
                    setSpeaking(false);
                }
            });
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t('think.voice_not_supported'));
            return;
        }
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = document.documentElement.lang?.startsWith('fr') ? 'fr-CA' : 'en-US';
        setListening(true);
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setChatInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setListening(false);
        };
        rec.onerror = rec.onend = () => setListening(false);
        rec.start();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!problem || loading || !answer.trim()) return;
        setLoading(true);
        axios
            .post(route('think.submit'), { problem_id: problem.id, answer: answer.trim() })
            .then(({ data }) => {
                setFeedback(data);
                if (data.new_total_points != null) setDisplayXp(data.new_total_points);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const handleNext = () => {
        setFeedback(null);
        setAnswer('');
        generateProblem();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-stone-800">{t('think.title')}</h1>
                    <div className="flex items-center gap-2">
                        <span className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700">
                            {displayXp} XP
                        </span>
                        {chatXpEarned > 0 && (
                            <span className="animate-pulse rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                                +{chatXpEarned} XP
                            </span>
                        )}
                        <span className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700">
                            {t('dashboard.level')} {progress.level}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={t('think.title')} />

            <div className="min-h-[80vh] bg-cream100/80 py-12">
                <div className="mx-auto max-w-5xl px-4">
                    {!problem && !generating && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
                            {generateError && (
                                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                    {generateError}
                                    <button
                                        type="button"
                                        onClick={() => setGenerateError(null)}
                                        className="ml-2 font-semibold underline"
                                    >
                                        {t('think.dismiss')}
                                    </button>
                                </div>
                            )}
                            <p className="mb-6 text-stone-600">{t('think.subtitle')}</p>
                            <div className="mb-6">
                                <label htmlFor="grade" className="mb-2 block text-center text-sm font-medium text-stone-600">
                                    {t('think.grade_label')}
                                </label>
                                <select
                                    id="grade"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="mx-auto block rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-stone-800 focus:border-stone-500 focus:ring-2 focus:ring-warm"
                                >
                                    {['grade_3', 'grade_4', 'grade_5', 'grade_6'].map((g) => (
                                        <option key={g} value={g}>
                                            {t(`grade.${g}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={generateProblem}
                                className="rounded-lg bg-coral px-8 py-4 text-base font-medium text-white transition hover:bg-coral-hover"
                            >
                                {t('think.get_problem')}
                            </button>
                        </div>
                    )}

                    {generating && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-16 text-center shadow-sm">
                            <Loader2 className="mx-auto h-16 w-16 animate-spin text-stone-400" strokeWidth={1.5} />
                            <p className="mt-6 text-lg font-medium text-stone-700">{t('think.generating')}</p>
                            <p className="mt-1 text-sm text-stone-500">{t('think.generating_hint')}</p>
                            <div className="mx-auto mt-6 flex max-w-xs gap-1">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:150ms]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}

                    {problem && !feedback && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Left: Problem + Canvas + Answer */}
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-medium text-stone-800">{problem.question_text}</p>
                                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-stone-400">
                                        {problem.grade ? t(`grade.${problem.grade}`) : t(`difficulty.${problem.difficulty}`)}
                                    </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={generateProblem}
                                            className="shrink-0 rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-warm/50"
                                        >
                                            {t('think.get_problem')}
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                                    <p className="mb-2 text-sm font-semibold text-stone-700">{t('think.thinking_canvas')}</p>
                                    <ThinkingCanvas />
                                </div>

                                <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                                    <label htmlFor="answer" className="mb-2 block text-sm font-medium text-stone-700">
                                        {t('think.your_answer')}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            ref={inputRef}
                                            id="answer"
                                            type="text"
                                            inputMode="numeric"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="?"
                                            className="flex-1 rounded-lg border border-stone-300 px-4 py-3 text-lg font-semibold focus:border-stone-500 focus:ring-2 focus:ring-warm"
                                            disabled={loading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !answer.trim()}
                                            className="rounded-lg bg-coral px-6 py-3 text-sm font-medium text-white transition hover:bg-coral-hover disabled:opacity-50"
                                        >
                                            {loading ? t('play.checking') : t('think.check')}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right: Chat with AI */}
                            <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
                                <div className="border-b border-coral/30 bg-coral px-4 py-3">
                                    <p className="font-semibold text-white">{t('think.ask_teacher')}</p>
                                    <p className="text-sm text-white/80">{t('think.ask_teacher_hint')}</p>
                                </div>
                                <div className="flex h-[420px] flex-col">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {messages.length === 0 && (
                                            <p className="text-sm text-stone-500">{t('think.chat_empty')}</p>
                                        )}
                                        {messages.map((m, i) => (
                                            <div
                                                key={i}
                                                className={`rounded-lg px-4 py-2 ${
                                                    m.role === 'user'
                                                        ? 'ml-8 bg-warm text-stone-800'
                                                        : 'mr-8 bg-coral text-white'
                                                }`}
                                            >
                                                <p className="text-sm">{m.content}</p>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="mr-8 rounded-lg bg-coral px-4 py-2">
                                                <span className="text-sm text-white">...</span>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="border-t border-stone-100 p-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChat(chatInput))}
                                                placeholder={t('think.ask_placeholder')}
                                                className="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-stone-500 focus:ring-2 focus:ring-warm"
                                                disabled={chatLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={startListening}
                                                disabled={chatLoading || listening}
                                                title={t('think.voice_input')}
                                                className={`rounded-lg px-3 py-2.5 transition ${
                                                    listening
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'border border-stone-200 text-stone-600 hover:bg-warm/50'
                                                }`}
                                            >
                                                <Mic className="h-5 w-5" strokeWidth={2} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => sendChat(chatInput)}
                                                disabled={chatLoading || !chatInput.trim()}
                                                className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2.5 text-sm font-medium text-white transition hover:bg-coral-hover disabled:opacity-50"
                                            >
                                                <Send className="h-4 w-4" strokeWidth={2} />
                                                {t('think.send')}
                                            </button>
                                        </div>
                                        {speaking && (
                                            <p className="mt-2 text-xs text-stone-500">{t('think.speaking')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {problem && feedback && (
                        <div className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
                            {feedback.correct ? (
                                <>
                                    <div className="mb-4 flex justify-center">
                                        <Check className="h-16 w-16 text-emerald-600" strokeWidth={2} />
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold text-emerald-600">{t('play.correct')}</h2>
                                    <p className="mb-4 text-stone-600">
                                        +{feedback.points_earned} XP • {t('think.total')} {feedback.new_total_points} XP
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4 flex justify-center">
                                        <X className="h-16 w-16 text-amber-500" strokeWidth={2} />
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold text-amber-600">{t('play.almost')}</h2>
                                    <p className="mb-2 text-stone-600">
                                        {t('play.answer_was')} <strong>{feedback.correct_answer}</strong>
                                    </p>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={handleNext}
                                className="mt-4 rounded-lg bg-coral px-8 py-4 text-sm font-medium text-white transition hover:bg-coral-hover"
                            >
                                {t('think.next_problem')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
