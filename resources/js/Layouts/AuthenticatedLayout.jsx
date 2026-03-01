import CompetitionInviteToast from '@/Components/CompetitionInviteToast';
import Dropdown from '@/Components/Dropdown';
import LocaleSwitcher from '@/Components/LocaleSwitcher';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { CompetitionChannelProvider } from '@/Contexts/CompetitionChannelContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const t = useTranslations();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <CompetitionChannelProvider userId={user?.id}>
        <div className="min-h-screen bg-slate-50/80">
            <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.03)] backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={route('dashboard')} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white">
                                        <BookOpen className="h-4 w-4" strokeWidth={2} />
                                    </span>
                                    <span className="text-lg font-bold tracking-tight text-slate-800">{t('game.name')}</span>
                                </Link>
                            </div>

                            <div className="hidden space-x-1 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    {t('nav.dashboard')}
                                </NavLink>
                                <NavLink
                                    href={route('think.index')}
                                    active={route().current('think.index')}
                                >
                                    {t('think.title')}
                                </NavLink>
                                <NavLink
                                    href={route('play')}
                                    active={route().current('play')}
                                >
                                    {t('nav.play')}
                                </NavLink>
                                <NavLink
                                    href={route('compete.index')}
                                    active={route().current('compete.index')}
                                >
                                    {t('compete.title')}
                                </NavLink>
                                <NavLink
                                    href={route('badges.index')}
                                    active={route().current('badges.index')}
                                >
                                    {t('nav.badges')}
                                </NavLink>
                                <NavLink
                                    href={route('stats.index')}
                                    active={route().current('stats.index')}
                                >
                                    {t('nav.stats')}
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <LocaleSwitcher />
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition duration-150 ease-in-out hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            {t('nav.profile')}
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            {t('nav.log_out')}
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition duration-150 ease-in-out hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 border-b border-slate-200 px-4 pb-3 pt-2">
                        <div className="sm:hidden">
                            <LocaleSwitcher />
                        </div>
                    </div>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            {t('nav.dashboard')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('think.index')}
                            active={route().current('think.index')}
                        >
                            {t('think.title')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('play')}
                            active={route().current('play')}
                        >
                            {t('nav.play')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('compete.index')}
                            active={route().current('compete.index')}
                        >
                            {t('compete.title')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('badges.index')}
                            active={route().current('badges.index')}
                        >
                            {t('nav.badges')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('stats.index')}
                            active={route().current('stats.index')}
                        >
                            {t('nav.stats')}
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-slate-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-slate-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-slate-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                {t('nav.profile')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                {t('nav.log_out')}
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>

            <CompetitionInviteToast />
        </div>
        </CompetitionChannelProvider>
    );
}
