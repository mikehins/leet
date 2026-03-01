import { useCompetitionChannel } from '@/Contexts/CompetitionChannelContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Link } from '@inertiajs/react';
import { Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CompetitionInviteToast() {
    const t = useTranslations();
    const { subscribeToInvites } = useCompetitionChannel();
    const [invite, setInvite] = useState(null);

    useEffect(() => {
        return subscribeToInvites((e) => {
            setInvite({ creatorName: e.creatorName, code: e.code });
        });
    }, [subscribeToInvites]);

    if (!invite) return null;

    const joinUrl = `${route('compete.join')}?code=${invite.code}`;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Trophy className="h-5 w-5 text-amber-600" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                        {t('compete.invite_from', { name: invite.creatorName })}
                    </p>
                    <Link
                        href={joinUrl}
                        className="mt-2 inline-block rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        {t('compete.click_to_join')}
                    </Link>
                </div>
                <button
                    type="button"
                    onClick={() => setInvite(null)}
                    className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={t('profile.cancel')}
                >
                    <X className="h-5 w-5" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
