import LocaleSwitcher from '@/Components/LocaleSwitcher';
import { useTranslations } from '@/hooks/useTranslations';
import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function GuestLayout({ children }) {
    const t = useTranslations();
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-8 sm:justify-center sm:pt-0">
            <div className="flex w-full max-w-md items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white">
                        <BookOpen className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="text-lg font-bold tracking-tight text-slate-800">{t('game.name')}</span>
                </Link>
                <LocaleSwitcher />
            </div>

            <div className="mt-8 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-8 py-8 shadow-sm sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
