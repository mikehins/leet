import { useTranslations } from '@/hooks/useTranslations';
import { Award, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';

export default function BadgeUnlockToast({ badges, onDismiss }) {
    const t = useTranslations();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            onDismiss?.();
        }, 4000);
        return () => clearTimeout(t);
    }, [onDismiss]);

    if (!visible || !badges?.length) return null;

    const badge = badges[0];
    const IconComponent = LucideIcons[badge.icon] || Award;

    return (
        <div
            className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-bounce"
            role="alert"
        >
            <div className="flex items-center gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 px-6 py-4 shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-amber-400 bg-amber-100">
                    <IconComponent className="h-8 w-8 text-amber-700" strokeWidth={2} />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                        {t('badge.new_badge')}
                    </p>
                    <p className="text-lg font-bold text-amber-900">
                        {t(badge.name_key) || badge.name_key}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setVisible(false);
                        onDismiss?.();
                    }}
                    className="rounded-lg p-1 text-amber-600 transition hover:bg-amber-200 hover:text-amber-800"
                    aria-label={t('profile.cancel')}
                >
                    <X className="h-5 w-5" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
