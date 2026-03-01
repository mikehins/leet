import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, Link, useForm } from '@inertiajs/react';
import { Users, FileText } from 'lucide-react';

export default function FamilyIndex({ children, flash }) {
    const t = useTranslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('family.store'), {
            onSuccess: () => reset('name', 'email', 'password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('family.title')} />

            <div className="mx-auto max-w-2xl space-y-8">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-stone-800">
                        {t('family.title')}
                    </h1>
                    <p className="mt-1 text-sm text-stone-600">
                        {t('family.subtitle')}
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-lg border border-warm bg-white p-6">
                    <h2 className="font-medium text-stone-800">{t('family.add_child')}</h2>
                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value={t('auth.name')} />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                autoComplete="name"
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value={t('auth.email')} />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password" value={t('auth.password')} />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password_confirmation" value={t('auth.confirm_password')} />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                        <PrimaryButton type="submit" disabled={processing}>
                            {t('family.add_child')}
                        </PrimaryButton>
                    </form>
                </div>

                <div className="rounded-lg border border-warm bg-white p-6">
                    <h2 className="font-medium text-stone-800">{t('family.your_children')}</h2>
                    {children.length === 0 ? (
                        <p className="mt-4 text-sm text-stone-500">{t('family.no_children')}</p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {children.map((child) => (
                                <li
                                    key={child.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-warm bg-cream/30 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/20 text-coral">
                                            <Users className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <div className="font-medium text-stone-800">{child.name}</div>
                                            <div className="text-sm text-stone-500">{child.email}</div>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('report-card.show', child.id)}
                                        className="flex items-center gap-1.5 rounded-lg border border-warm bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-warm"
                                    >
                                        <FileText className="h-4 w-4" strokeWidth={2} />
                                        {t('nav.report_card')}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
