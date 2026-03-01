import LocaleSwitcher from '@/Components/LocaleSwitcher';
import { Head, Link } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import { BookOpen, Plus, Minus, X, Divide } from 'lucide-react';

export default function Welcome({ auth, canLogin, canRegister, game }) {
    const t = useTranslations();
    return (
        <>
            <Head title={t('game.name')} />
            <div className="min-h-screen bg-cream">
                <div className="mx-auto max-w-5xl px-6 py-16">
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-coral bg-coral text-white">
                                <BookOpen className="h-5 w-5" strokeWidth={2} />
                            </span>
                            <span className="font-display text-lg font-semibold tracking-tight text-brown">
                                {t('game.name')}
                            </span>
                        </div>
                        <nav className="flex items-center gap-2">
                            <LocaleSwitcher />
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg border border-coral bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-coral-hover"
                                >
                                    {t('nav.go_to_dashboard')}
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-xl border-2 border-warm px-5 py-2.5 text-sm font-medium text-brown transition hover:bg-sage-light hover:border-sage hover:text-sage"
                                        >
                                            {t('nav.log_in')}
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg border border-coral bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-coral-hover"
                                        >
                                            {t('nav.get_started')}
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="mt-32 text-center">
                        <h1 className="font-display text-5xl font-bold tracking-tight text-brown md:text-6xl md:leading-[1.1]">
                            {t('game.learn_math')}
                        </h1>
                        <p className="mx-auto mt-8 max-w-lg text-lg text-brown leading-relaxed">
                            {t('game.description')}
                        </p>
                        {!auth?.user && (
                            <Link
                                href={route('register')}
                                className="mt-10 inline-flex items-center gap-2 rounded-2xl border-2 border-coral bg-coral px-10 py-4 text-base font-semibold text-white transition hover:bg-coral-hover"
                            >
                                {t('nav.start_quest')}
                            </Link>
                        )}
                        <div className="mt-24 flex justify-center gap-14">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-coral bg-coral-light text-coral">
                                <Plus className="h-7 w-7" strokeWidth={2} />
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-sage bg-sage-light text-sage">
                                <Minus className="h-7 w-7" strokeWidth={2} />
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-mustard bg-amber-50 text-amber-700">
                                <X className="h-7 w-7" strokeWidth={2} />
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-coral bg-coral-light text-coral">
                                <Divide className="h-7 w-7" strokeWidth={2} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
