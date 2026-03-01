import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function RewardsIndex({ totalPoints, dollarsValue, tiers, recentRequests }) {
    const t = useTranslations();
    const { flash } = usePage().props;
    const [selectedTier, setSelectedTier] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        points_spent: 0,
        message: '',
    });

    const canRedeem = (points) => totalPoints >= points;

    const handleRequest = (tier) => {
        setSelectedTier(tier);
        setData({ points_spent: tier.points, message: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTier || !canRedeem(selectedTier.points)) return;
        post(route('rewards.store'), {
            preserveScroll: true,
            onSuccess: () => setSelectedTier(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="font-display text-2xl font-bold tracking-tight text-stone-800">
                    {t('rewards.title')}
                </h1>
            }
        >
            <Head title={t('rewards.title')} />

            <div className="min-h-screen bg-cream py-12">
                <div className="mx-auto max-w-2xl px-4">
                    {flash?.success && (
                        <div className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
                            {flash.success}
                        </div>
                    )}

                    {/* Balance card */}
                    <div className="mb-8 overflow-hidden rounded-lg border border-warm bg-white p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                                    {t('rewards.your_balance')}
                                </p>
                                <p className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-800">
                                    {totalPoints} {t('rewards.points')}
                                </p>
                                <p className="mt-1 text-sm font-medium text-stone-600">
                                    ≈ ${dollarsValue.toFixed(2)} {t('rewards.value')}
                                </p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-coral/30 bg-coral-light">
                                <Gift className="h-8 w-8 text-coral" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Treasure chest / Request section */}
                    <div className="mb-8 rounded-lg border border-warm bg-white p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                            <Sparkles className="h-5 w-5 text-stone-500" strokeWidth={2} />
                            {t('rewards.open_treasure')}
                        </h2>
                        <p className="mb-6 text-stone-600">
                            {t('rewards.treasure_intro')}
                        </p>

                        <div className="mb-6 grid gap-4 sm:grid-cols-3">
                            {tiers.map((tier) => (
                                <button
                                    key={tier.dollars}
                                    type="button"
                                    onClick={() => handleRequest(tier)}
                                    disabled={!canRedeem(tier.points)}
                                    className={`flex flex-col items-center rounded-lg border p-6 transition ${
                                        canRedeem(tier.points)
                                            ? 'border-warm bg-warm/30 hover:bg-warm'
                                            : 'cursor-not-allowed border-warm bg-warm/20 opacity-60'
                                    }`}
                                >
                                    <span className="text-xl font-semibold text-stone-800">{tier.label}</span>
                                    <span className="mt-1 text-sm text-stone-600">{tier.points} pts</span>
                                    {!canRedeem(tier.points) && (
                                        <span className="mt-2 text-xs text-amber-600">
                                            {t('rewards.need_more')}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Request form modal */}
                        {selectedTier && (
                            <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-warm bg-warm/30 p-6">
                                <h3 className="mb-4 font-semibold text-stone-800">
                                    {t('rewards.request_for', { amount: selectedTier.label })}
                                </h3>
                                <p className="mb-4 text-sm text-stone-600">
                                    {t('rewards.message_optional')}
                                </p>
                                <textarea
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder={t('rewards.message_placeholder')}
                                    rows={3}
                                    className="mb-4 w-full rounded-lg border border-warm px-4 py-3 text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-warm"
                                    maxLength={500}
                                />
                                {errors.points_spent && (
                                    <p className="mb-2 text-sm text-red-600">{errors.points_spent}</p>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTier(null)}
                                        className="rounded-lg border border-warm bg-white px-4 py-2.5 font-semibold text-stone-700 transition hover:bg-warm"
                                    >
                                        {t('profile.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg border border-coral bg-coral px-6 py-2.5 text-sm font-medium text-white transition hover:bg-coral-hover disabled:opacity-50"
                                    >
                                        {processing ? t('play.checking') : t('rewards.request_reward')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Recent requests */}
                    {recentRequests.length > 0 && (
                        <div className="rounded-lg border border-warm bg-white p-6">
                            <h2 className="mb-4 text-base font-semibold text-stone-800">
                                {t('rewards.recent_requests')}
                            </h2>
                            <ul className="space-y-3">
                                {recentRequests.map((r) => (
                                    <li
                                        key={r.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warm bg-warm/50 px-4 py-3"
                                    >
                                            <span className="font-medium text-stone-700">
                                            {r.reward_tier} ({r.points_spent} pts)
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-warm bg-warm px-3 py-1 text-xs font-medium text-stone-700">
                                                {r.status}
                                            </span>
                                            <span className="text-sm text-stone-500">{r.created_at}</span>
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
