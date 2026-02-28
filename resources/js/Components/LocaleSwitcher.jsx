import { router, usePage } from '@inertiajs/react';

export default function LocaleSwitcher() {
    const { locale = 'en' } = usePage().props;

    const switchLocale = (newLocale) => {
        if (newLocale === locale) return;
        router.post(route('locale.switch', { locale: newLocale }));
    };

    return (
        <div className="ms-4 flex gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
            <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    locale === 'en'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                }`}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => switchLocale('fr')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    locale === 'fr'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                }`}
            >
                FR
            </button>
        </div>
    );
}
