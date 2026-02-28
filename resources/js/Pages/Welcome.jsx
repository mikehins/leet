import LocaleSwitcher from '@/Components/LocaleSwitcher';
import { Head, Link } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import { BookOpen, Plus, Minus, X, Divide } from 'lucide-react';

export default function Welcome({ auth, canLogin, canRegister, game }) {
    const t = useTranslations();
    return (
        <>
            <Head title={t('game.name')} />
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-4xl px-6 py-16">
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white">
                                <BookOpen className="h-5 w-5" strokeWidth={2} />
                            </span>
                            <span className="text-xl font-bold tracking-tight text-slate-800">
                                {t('game.name')}
                            </span>
                        </div>
                        <nav className="flex items-center gap-3">
                            <LocaleSwitcher />
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                                >
                                    {t('nav.go_to_dashboard')}
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            {t('nav.log_in')}
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                                        >
                                            {t('nav.get_started')}
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="mt-28 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                            {t('game.learn_math')}
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
                            {t('game.description')}
                        </p>
                        {!auth?.user && (
                            <Link
                                href={route('register')}
                                className="mt-8 inline-block rounded-xl bg-slate-800 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700"
                            >
                                {t('nav.start_quest')}
                            </Link>
                        )}
                        <div className="mt-16 flex justify-center gap-12 text-slate-400">
                            <Plus className="h-10 w-10" strokeWidth={1.5} />
                            <Minus className="h-10 w-10" strokeWidth={1.5} />
                            <X className="h-10 w-10" strokeWidth={1.5} />
                            <Divide className="h-10 w-10" strokeWidth={1.5} />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
