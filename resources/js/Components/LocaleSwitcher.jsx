import { router, usePage } from '@inertiajs/react';

export default function LocaleSwitcher() {
    const { locale = 'en' } = usePage().props;

    const switchLocale = (newLocale) => {
        if (newLocale === locale) return;
        router.post(route('locale.switch', { locale: newLocale }));
    };

    return (
        <div className="ms-4 flex gap-1 rounded-lg border border-warm bg-warm/50 p-1">
            <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    locale === 'en'
                        ? 'bg-white text-stone-800 shadow-sm'
                        : 'text-stone-600 hover:text-stone-800'
                }`}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => switchLocale('fr')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    locale === 'fr'
                        ? 'bg-white text-stone-800 shadow-sm'
                        : 'text-stone-600 hover:text-stone-800'
                }`}
            >
                FR
            </button>
        </div>
    );
}
