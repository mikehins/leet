import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Head, useForm } from '@inertiajs/react';
export default function CompeteJoin({ game, code = '' }) {
    const t = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        code: code || '',
        grade: 'grade_4',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('compete.join.submit'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                    {t('compete.join_game')}
                </h1>
            }
        >
            <Head title={t('compete.join_game')} />

            <div className="min-h-screen bg-slate-50/50 py-8">
                <div className="mx-auto max-w-md px-4">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-700">
                                {t('compete.enter_code')}
                            </label>
                            <input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="1234"
                                className="block w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-center text-xl font-semibold uppercase tracking-widest placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                autoComplete="off"
                            />
                            {errors.code && (
                                <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="grade" className="mb-2 block text-sm font-medium text-slate-700">
                                {t('think.grade_label')}
                            </label>
                            <select
                                id="grade"
                                value={data.grade}
                                onChange={(e) => setData('grade', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            >
                                {['grade_3', 'grade_4', 'grade_5', 'grade_6'].map((g) => (
                                    <option key={g} value={g}>
                                        {t(`grade.${g}`)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={processing || data.code.length !== 4}
                            className="w-full rounded-xl bg-slate-800 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                        >
                            {t('compete.join')}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
