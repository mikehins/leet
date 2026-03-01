import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Award, ChevronDown, FileText, Plus, Minus, Divide, X, Target, TrendingUp, Lightbulb, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

const TOPIC_ICONS = { addition: Plus, subtraction: Minus, multiplication: X, division: Divide };
const TOPIC_LABELS = { addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' };

export default function ReportCardShow({ targetUser, reports, percentiles, chartData, children = [], isParentViewing }) {
    const { flash } = usePage().props;
    const t = useTranslations();
    const [childSelectorOpen, setChildSelectorOpen] = useState(false);
    const [askQuestion, setAskQuestion] = useState('');
    const [askLoading, setAskLoading] = useState(false);
    const [askAnswer, setAskAnswer] = useState(null);

    const formatDate = (d) => {
        const date = new Date(d);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const shortDate = (d) => {
        const date = new Date(d);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const percentileLabel = (p) => {
        if (p == null) return '—';
        if (p >= 90) return `${p}th (top 10%)`;
        if (p >= 75) return `${p}th (above average)`;
        if (p >= 50) return `${p}th`;
        if (p >= 25) return `${p}th`;
        return `${p}th`;
    };

    const handleAsk = async () => {
        if (!askQuestion.trim() || askLoading) return;
        setAskLoading(true);
        setAskAnswer(null);
        try {
            const { data } = await axios.post(route('report-card.ask'), {
                question: askQuestion.trim(),
                user_id: isParentViewing ? targetUser.id : undefined,
            });
            setAskAnswer(data.answer);
        } catch {
            setAskAnswer(t('report_card.ask_error'));
        } finally {
            setAskLoading(false);
        }
    };

    const topicChartData = (chartData?.accuracy_by_topic ?? []).map((d) => ({
        ...d,
        name: t(`topics.${d.topic}`) || TOPIC_LABELS[d.topic],
    }));

    const timeChartData = (chartData?.accuracy_over_time ?? []).map((d) => ({
        ...d,
        dateLabel: shortDate(d.date),
    }));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-lg font-semibold text-stone-700 sm:text-xl">{t('report_card.title')}</h1>
                    {children?.length > 1 && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setChildSelectorOpen(!childSelectorOpen)}
                                className="flex items-center gap-2 rounded-xl border border-warm bg-white px-4 py-2 text-sm font-medium text-stone-700"
                            >
                                {targetUser.avatar_url ? (
                                    <img src={targetUser.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                                ) : (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coral/20 text-coral">
                                        {targetUser.name?.charAt(0)}
                                    </span>
                                )}
                                {targetUser.name}
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {childSelectorOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setChildSelectorOpen(false)} />
                                    <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-warm bg-white py-1 shadow-lg">
                                        {children.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={route('report-card.show', c.id)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-warm"
                                            >
                                                {c.avatar_url ? (
                                                    <img src={c.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                                                ) : (
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coral/20 text-coral">
                                                        {c.name?.charAt(0)}
                                                    </span>
                                                )}
                                                {c.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            }
        >
            <Head title={t('report_card.title')} />

            {flash?.success && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {flash.success}
                </div>
            )}

            <div className="min-h-[60vh] space-y-8">
                {/* Charts */}
                {(topicChartData.length > 0 || timeChartData.length > 0) && (
                    <div className="space-y-6">
                        {topicChartData.length > 0 && (
                            <div className="rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:p-6">
                                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                                    <Target className="h-5 w-5 text-coral" strokeWidth={2} />
                                    {t('report_card.accuracy_by_topic')}
                                </h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(v) => [`${v}%`, t('report_card.accuracy')]} />
                                            <Bar dataKey="accuracy" fill="#f97316" radius={[4, 4, 0, 0]} name={t('report_card.accuracy')} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                        {timeChartData.length > 1 && (
                            <div className="rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:p-6">
                                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                                    <TrendingUp className="h-5 w-5 text-sage" strokeWidth={2} />
                                    {t('report_card.accuracy_over_time')}
                                </h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={timeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(v) => [`${v}%`, t('report_card.accuracy')]} />
                                            <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name={t('report_card.accuracy')} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Percentile comparison */}
                <div className="rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                        <TrendingUp className="h-5 w-5 text-sage" strokeWidth={2} />
                        {t('report_card.how_you_compare')}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-warm/40 bg-stone-50/50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                                {t('report_card.vs_all_users')}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-stone-800">
                                {percentileLabel(percentiles?.percentile_vs_users)} {t('report_card.percentile')}
                            </p>
                            <p className="mt-0.5 text-sm text-stone-600">
                                {t('report_card.accuracy')}: {percentiles?.accuracy ?? 0}%
                            </p>
                        </div>
                        <div className="rounded-lg border border-warm/40 bg-stone-50/50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                                {percentiles?.country ? t('report_card.vs_country', { country: percentiles.country }) : t('report_card.vs_country_na')}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-stone-800">
                                {percentileLabel(percentiles?.percentile_vs_country)} {t('report_card.percentile')}
                            </p>
                            {!percentiles?.country && (
                                <p className="mt-0.5 text-xs text-stone-500">{t('report_card.set_country_hint')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ask AI */}
                <div className="rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                        <MessageCircle className="h-5 w-5 text-coral" strokeWidth={2} />
                        {t('report_card.ask_ai')}
                    </h2>
                    <p className="mb-3 text-sm text-stone-600">{t('report_card.ask_ai_hint')}</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={askQuestion}
                            onChange={(e) => setAskQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            placeholder={t('report_card.ask_placeholder')}
                            className="flex-1 rounded-xl border border-warm px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-coral focus:ring-2 focus:ring-coral/20"
                            disabled={askLoading}
                        />
                        <button
                            type="button"
                            onClick={handleAsk}
                            disabled={askLoading || !askQuestion.trim()}
                            className="flex items-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-sm font-medium text-white transition hover:bg-coral-hover disabled:opacity-50"
                        >
                            {askLoading ? (
                                <span className="animate-pulse">{t('play.thinking')}</span>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" strokeWidth={2} />
                                    {t('report_card.ask')}
                                </>
                            )}
                        </button>
                    </div>
                    {askAnswer && (
                        <div className="mt-4 rounded-lg border border-sage/40 bg-sage-light p-4">
                            <p className="flex items-start gap-2 text-sm text-stone-700">
                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sage" strokeWidth={2} />
                                {askAnswer}
                            </p>
                        </div>
                    )}
                </div>

                {/* Parent setting */}
                {isParentViewing && (
                    <div className="rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:p-6">
                        <h2 className="mb-4 text-base font-semibold text-stone-800">{t('report_card.parent_settings')}</h2>
                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={targetUser.require_suggested_practice_before_compete ?? false}
                                onChange={(e) => {
                                    router.patch(route('report-card.update-setting'), {
                                        child_id: targetUser.id,
                                        require_suggested_practice_before_compete: e.target.checked,
                                    }, { preserveScroll: true });
                                }}
                                className="h-4 w-4 rounded border-warm text-coral focus:ring-coral"
                            />
                            <span className="text-sm text-stone-700">{t('report_card.require_practice_before_compete')}</span>
                        </label>
                    </div>
                )}

                {/* Reports list */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                        <FileText className="h-5 w-5 text-coral" strokeWidth={2} />
                        {t('report_card.reports')}
                    </h2>
                    {reports.length === 0 ? (
                        <div className="rounded-xl border border-warm/60 bg-stone-50/30 p-8 text-center">
                            <FileText className="mx-auto mb-3 h-12 w-12 text-stone-400" strokeWidth={1.5} />
                            <p className="text-stone-600">{t('report_card.no_reports')}</p>
                            <p className="mt-1 text-sm text-stone-500">{t('report_card.no_reports_hint')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="overflow-hidden rounded-xl border border-warm/60 bg-white shadow-sm"
                                >
                                    <div className="border-b border-warm/40 bg-stone-50/80 px-4 py-2.5 sm:px-6">
                                        <p className="text-sm font-medium text-stone-700">
                                            {formatDate(report.period_start)} – {formatDate(report.period_end)}
                                            {report.is_fully_completed && (
                                                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sage/20 px-2 py-0.5 text-xs font-semibold text-sage">
                                                    <Award className="h-3 w-3" /> {t('report_card.completed')}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <p className="mb-4 text-stone-700">{report.summary}</p>

                                        {report.ai_insights?.length > 0 && (
                                            <div className="mb-4 rounded-lg border border-amber-200/60 bg-amber-50/50 p-4">
                                                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                                                    <Lightbulb className="h-4 w-4" strokeWidth={2} />
                                                    {t('report_card.ai_insights')}
                                                </p>
                                                <ul className="space-y-1 text-sm text-amber-900">
                                                    {report.ai_insights.map((insight, i) => (
                                                        <li key={i} className="flex gap-2">
                                                            <span className="text-amber-500">•</span>
                                                            {insight}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {(report.strengths?.length > 0 || report.areas_to_improve?.length > 0) && (
                                            <div className="mb-4 grid gap-4 sm:grid-cols-2">
                                                {report.strengths?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{t('report_card.strengths')}</p>
                                                        <ul className="mt-1 list-inside list-disc text-sm text-stone-600">
                                                            {report.strengths.map((s, i) => (
                                                                <li key={i}>{s}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {report.areas_to_improve?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">{t('report_card.areas_to_improve')}</p>
                                                        <ul className="mt-1 list-inside list-disc text-sm text-stone-600">
                                                            {report.areas_to_improve.map((a, i) => (
                                                                <li key={i}>{a}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {report.recommendations?.length > 0 && (
                                            <div className="mb-4 rounded-lg border border-sage/40 bg-sage-light p-4">
                                                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage">
                                                    <Target className="h-4 w-4" strokeWidth={2} />
                                                    {t('report_card.recommendations')}
                                                </p>
                                                <ol className="list-inside list-decimal space-y-1.5 text-sm text-stone-700">
                                                    {report.recommendations.map((rec, i) => (
                                                        <li key={i}>{rec}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}

                                        {report.suggested_progress?.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{t('report_card.suggested_practice')}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.suggested_progress.map((p) => {
                                                        const Icon = TOPIC_ICONS[p.topic];
                                                        const done = p.correct_count >= p.target_count;
                                                        return (
                                                            <Link
                                                                key={p.topic}
                                                                href={route(`play.${p.topic}`, { grade: 'grade_4' })}
                                                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                                                    done
                                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                                        : 'border-warm bg-warm/30 text-stone-700 hover:bg-warm'
                                                                }`}
                                                            >
                                                                {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
                                                                {t(`topics.${p.topic}`)}: {p.correct_count}/{p.target_count}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
