import { useUserChannel } from '@/Contexts/UserChannelContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Link } from '@inertiajs/react';
import { UserCheck, UserPlus, X } from 'lucide-react';

export default function FriendRequestToast() {
    const t = useTranslations();
    const { friendRequestToast, dismissFriendRequestToast } = useUserChannel();

    if (!friendRequestToast) return null;

    const isAccepted = friendRequestToast.type === 'accepted';
    const message = isAccepted
        ? t('friends.request_accepted_toast', { name: friendRequestToast.name })
        : t('friends.request_sent_toast', { name: friendRequestToast.name });

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <div className="flex items-start gap-3 rounded-lg border border-warm bg-white p-4 shadow-lg">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isAccepted ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    {isAccepted ? (
                        <UserCheck className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                    ) : (
                        <UserPlus className="h-5 w-5 text-amber-600" strokeWidth={2} />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-800">{message}</p>
                    <Link
                        href={route('friends.index')}
                        className="mt-2 inline-block rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white  transition hover:bg-coral-hover"
                    >
                        {t('friends.view_requests')}
                    </Link>
                </div>
                <button
                    type="button"
                    onClick={dismissFriendRequestToast}
                    className="shrink-0 rounded-lg p-1 text-stone-400 transition hover:bg-warm hover:text-stone-600"
                    aria-label={t('profile.cancel')}
                >
                    <X className="h-5 w-5" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
