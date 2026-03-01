import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, router } from '@inertiajs/react';
export default function ProfileSelectIndex({ profiles }) {
    const t = useTranslations();

    const selectProfile = (userId) => {
        router.post(route('profile-select.store'), { user_id: userId });
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('profile_select.title')} />

            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
                <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-stone-800">
                    {t('profile_select.title')}
                </h1>
                <p className="mb-10 text-stone-600">
                    {t('profile_select.subtitle')}
                </p>

                <div className="flex flex-wrap justify-center gap-6">
                    {profiles.map((profile) => (
                        <button
                            key={profile.id}
                            type="button"
                            onClick={() => selectProfile(profile.id)}
                            className="group flex flex-col items-center rounded-xl border-2 border-warm bg-white p-8 transition-all hover:border-coral hover:bg-coral-light/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                        >
                            <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-warm bg-warm transition group-hover:border-coral">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-stone-600">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className="text-base font-semibold text-stone-800">
                                {profile.name}
                            </span>
                            {profile.is_parent && (
                                <span className="mt-1 text-xs text-stone-500">
                                    {t('profile_select.parent')}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
