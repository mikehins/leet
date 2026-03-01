import LocaleSwitcher from '@/Components/LocaleSwitcher';
import { useTranslations } from '@/hooks/useTranslations';
import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function GuestLayout({ children }) {
    const t = useTranslations();
    return (
        <div className="flex min-h-screen flex-col items-center bg-cream pt-8 sm:justify-center sm:pt-0">
            <div className="flex w-full max-w-md items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-coral bg-coral text-white">
                        <BookOpen className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="font-display text-base font-semibold tracking-tight text-stone-800">{t('game.name')}</span>
                </Link>
                <LocaleSwitcher />
            </div>

            <div className="mt-8 w-full overflow-hidden rounded-lg border border-warm bg-white px-8 py-8 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
