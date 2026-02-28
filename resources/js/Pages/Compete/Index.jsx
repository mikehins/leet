import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function CompeteIndex({ game }) {
    const t = useTranslations();
    const [grade, setGrade] = useState('grade_4');

    const createGame = () => {
        router.post(route('compete.create'), { grade }, { preserveState: false });
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                    {t('compete.title')}
                </h1>
            }
        >
            <Head title={t('compete.title')} />

            <div className="min-h-screen bg-slate-50/50 py-8">
                <div className="mx-auto max-w-md px-4">
                    <p className="mb-8 text-center text-slate-600">
                        {t('compete.subtitle')}
                    </p>

                    <div className="mb-6">
                        <label htmlFor="grade" className="mb-2 block text-sm font-medium text-slate-700">
                            {t('think.grade_label')}
                        </label>
                        <select
                            id="grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        >
                            {['grade_3', 'grade_4', 'grade_5', 'grade_6'].map((g) => (
                                <option key={g} value={g}>
                                    {t(`grade.${g}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={createGame}
                            className="w-full rounded-xl bg-slate-800 px-8 py-5 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700"
                        >
                            {t('compete.create_game')}
                        </button>

                        <a
                            href={route('compete.join')}
                            className="block w-full rounded-xl border border-slate-300 bg-white px-8 py-5 text-center text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            {t('compete.join_game')}
                        </a>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
