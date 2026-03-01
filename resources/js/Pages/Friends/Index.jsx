import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { UserPlus, Search, UserCheck, UserMinus, X, Check, Award, Bell } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

function useDebounce(callback, delay) {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef(null);
    callbackRef.current = callback;
    useEffect(() => () => clearTimeout(timeoutRef.current), []);
    return useCallback(
        (...args) => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
        },
        [delay]
    );
}

export default function FriendsIndex({ game, friends, pending_received, pending_sent, notifications = [] }) {
    const t = useTranslations();
    const { flash, errors } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const successMessage = flash?.success ?? null;
    const errorMessage = flash?.error ?? errors?.user_id ?? errors?.error;

    const debouncedSearch = useDebounce(async (q) => {
        if (!q || q.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const { data } = await axios.get(route('friends.search'), { params: { q } });
            setSearchResults(data.users ?? []);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, 300);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const sendRequest = (userId) => {
        router.post(route('friends.send'), { user_id: userId }, { preserveScroll: true });
    };

    const acceptRequest = (requestId) => {
        router.post(route('friends.accept', requestId), {}, { preserveScroll: true });
    };

    const rejectRequest = (requestId) => {
        router.post(route('friends.reject', requestId), {}, { preserveScroll: true });
    };

    const cancelRequest = (requestId) => {
        router.delete(route('friends.cancel', requestId), { preserveScroll: true });
    };

    const markAllRead = () => {
        router.post(route('friends.notifications.read'), {}, { preserveScroll: true });
    };

    const clearNotifications = () => {
        if (confirm(t('friends.clear_notifications_confirm'))) {
            router.delete(route('friends.notifications.clear'), { preserveScroll: true });
        }
    };

    const unfriend = (userId) => {
        if (confirm(t('friends.unfriend_confirm'))) {
            router.delete(route('friends.unfriend', userId), { preserveScroll: true });
        }
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-lg font-semibold text-stone-700 sm:text-xl">{t('friends.title')}</h1>
            }
        >
            <Head title={t('friends.title')} />

            <div className="min-h-[60vh]">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:gap-8">
                    <div className="min-w-0 flex-1">
                    {successMessage && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {errorMessage}
                        </div>
                    )}

                    {/* Search */}
                    <div className="mb-6 rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                            <Search className="h-5 w-5" strokeWidth={2} />
                            {t('friends.search_users')}
                        </h2>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder={t('friends.search_placeholder')}
                                className="block w-full min-h-[44px] rounded-xl border border-warm px-4 py-3 pr-10 text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-warm"
                            />
                            {searching && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500">
                                    {t('friends.searching')}
                                </span>
                            )}
                        </div>
                        {searchResults.length > 0 && (
                            <ul className="mt-3 space-y-2">
                                {searchResults.map((user) => (
                                    <li
                                        key={user.id}
                                        className="flex items-center justify-between rounded-lg border border-warm bg-warm/50 px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-medium text-stone-800">{user.name}</p>
                                            <p className="text-sm text-stone-500">{user.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => sendRequest(user.id)}
                                            className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-coral px-4 py-2.5 text-sm font-medium text-white transition hover:bg-coral-hover"
                                        >
                                            <UserPlus className="h-4 w-4" strokeWidth={2} />
                                            {t('friends.add')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                            <p className="mt-3 text-sm text-stone-500">{t('friends.no_results')}</p>
                        )}
                    </div>

                    {/* Pending received */}
                    {pending_received.length > 0 && (
                        <div className="mb-6 rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                                <UserCheck className="h-5 w-5" strokeWidth={2} />
                                {t('friends.requests_received')}
                            </h2>
                            <ul className="space-y-3">
                                {pending_received.map((req) => (
                                    <li
                                        key={req.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warm bg-warm/50 p-4"
                                    >
                                        <div>
                                            <p className="font-medium text-stone-800">{req.sender.name}</p>
                                            <p className="text-sm text-stone-500">{req.sender.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => acceptRequest(req.id)}
                                                className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
                                            >
                                                <Check className="h-4 w-4" strokeWidth={2.5} />
                                                {t('friends.accept')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => rejectRequest(req.id)}
                                                className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-warm bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-warm"
                                            >
                                                <X className="h-4 w-4" strokeWidth={2.5} />
                                                {t('friends.decline')}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Pending sent */}
                    {pending_sent.length > 0 && (
                        <div className="mb-6 rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                                <UserPlus className="h-5 w-5" strokeWidth={2} />
                                {t('friends.requests_sent')}
                            </h2>
                            <ul className="space-y-3">
                                {pending_sent.map((req) => (
                                    <li
                                        key={req.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warm bg-warm/50 p-4"
                                    >
                                        <div>
                                            <p className="font-medium text-stone-800">{req.receiver.name}</p>
                                            <p className="text-sm text-stone-500">{req.receiver.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => cancelRequest(req.id)}
                                            className="min-h-[44px] rounded-xl border border-warm bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-warm"
                                        >
                                            {t('friends.cancel')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Friends list */}
                    <div className="rounded-xl border border-warm/60 bg-white p-4 shadow-sm sm:p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                            <UserCheck className="h-5 w-5" strokeWidth={2} />
                            {t('friends.my_friends')} ({friends.length})
                        </h2>
                        {friends.length === 0 ? (
                            <p className="text-stone-500">{t('friends.no_friends')}</p>
                        ) : (
                            <ul className="space-y-3">
                                {friends.map((friend) => (
                                    <li
                                        key={friend.id}
                                        className="flex flex-wrap items-center gap-3 rounded-lg border border-warm bg-warm/30 p-4"
                                    >
                                        <Link
                                            href={route('stats.show', friend.id)}
                                            className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
                                        >
                                            {friend.avatar_url ? (
                                                <img src={friend.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                    <UserCheck className="h-5 w-5" strokeWidth={2} />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-stone-800">{friend.name}</p>
                                            <p className="text-sm text-stone-500">{friend.email}</p>
                                            {friend.stats && (
                                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-600">
                                                    <span>{t('dashboard.level')} {friend.stats.level}</span>
                                                    <span>{friend.stats.total_points} XP</span>
                                                    <span>{friend.stats.badges_earned} {t('nav.badges')}</span>
                                                    {friend.stats.current_streak > 0 && (
                                                        <span>{friend.stats.current_streak} {t('dashboard.streak')}</span>
                                                    )}
                                                </div>
                                            )}
                                            </div>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => unfriend(friend.id)}
                                            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-warm px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                            title={t('friends.unfriend')}
                                        >
                                            <UserMinus className="h-4 w-4" strokeWidth={2} />
                                            {t('friends.unfriend')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                        {/* Notifications - mobile (below main content) */}
                        <div className="mt-8 lg:hidden">
                            <div className="rounded-lg border border-warm bg-white p-6 shadow-sm">
                                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                                    <Bell className="h-5 w-5" strokeWidth={2} />
                                    {t('friends.notifications')}
                                    {unreadCount > 0 && (
                                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </h2>
                                {notifications.length > 0 ? (
                                    <>
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={markAllRead}
                                                    className="flex-1 text-center text-sm font-medium text-stone-600 hover:text-stone-800"
                                                >
                                                    {t('friends.mark_all_read')}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={clearNotifications}
                                                className="flex-1 text-center text-sm font-medium text-stone-500 hover:text-stone-700"
                                            >
                                                {t('friends.clear_notifications')}
                                            </button>
                                        </div>
                                        <ul className="space-y-2">
                                            {notifications.slice(0, 5).map((n) => (
                                                <li
                                                    key={n.id}
                                                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                                                        n.read_at ? 'border-warm bg-warm/30' : 'border-amber-200 bg-amber-50/50'
                                                    }`}
                                                >
                                                    <Award className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={2} />
                                                    <p className="min-w-0 flex-1 text-sm text-stone-700">
                                                        {n.type === 'friend_badge_earned' && (
                                                            <>
                                                                <span className="font-medium">{n.data?.actor_name}</span>{' '}
                                                                {t('friends.earned_badge')}{' '}
                                                                <span className="font-medium">{t(n.data?.badge_name_key) || n.data?.badge_name_key}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p className="text-sm text-stone-500">{t('friends.no_notifications')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notifications sidebar - desktop */}
                    <aside className="hidden w-80 shrink-0 lg:block">
                        <div className="sticky top-14">
                            <div className="rounded-lg border border-warm bg-white p-6 shadow-sm">
                                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-800">
                                    <Bell className="h-5 w-5" strokeWidth={2} />
                                    {t('friends.notifications')}
                                    {unreadCount > 0 && (
                                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </h2>
                                {notifications.length > 0 ? (
                                    <>
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={markAllRead}
                                                    className="flex-1 text-center text-sm font-medium text-stone-600 hover:text-stone-800"
                                                >
                                                    {t('friends.mark_all_read')}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={clearNotifications}
                                                className="flex-1 text-center text-sm font-medium text-stone-500 hover:text-stone-700"
                                            >
                                                {t('friends.clear_notifications')}
                                            </button>
                                        </div>
                                        <ul className="space-y-2">
                                            {notifications.map((n) => (
                                                <li
                                                    key={n.id}
                                                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                                                        n.read_at ? 'border-warm bg-warm/30' : 'border-amber-200 bg-amber-50/50'
                                                    }`}
                                                >
                                                    <Award className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={2} />
                                                    <p className="min-w-0 flex-1 text-sm text-stone-700">
                                                        {n.type === 'friend_badge_earned' && (
                                                            <>
                                                                <span className="font-medium">{n.data?.actor_name}</span>{' '}
                                                                {t('friends.earned_badge')}{' '}
                                                                <span className="font-medium">{t(n.data?.badge_name_key) || n.data?.badge_name_key}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p className="text-sm text-stone-500">{t('friends.no_notifications')}</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
