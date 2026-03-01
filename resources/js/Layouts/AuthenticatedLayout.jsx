import CompetitionInviteToast from '@/Components/CompetitionInviteToast';
import FriendRequestToast from '@/Components/FriendRequestToast';
import Dropdown from '@/Components/Dropdown';
import LocaleSwitcher from '@/Components/LocaleSwitcher';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import SidebarNavLink from '@/Components/SidebarNavLink';
import { CompetitionChannelProvider } from '@/Contexts/CompetitionChannelContext';
import { UserChannelProvider, useUserChannel } from '@/Contexts/UserChannelContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Home,
    Brain,
    Gamepad2,
    Swords,
    BarChart3,
    Users,
    UsersRound,
    Award,
    Gift,
    UserCircle,
    Menu,
    X,
    FileText,
} from 'lucide-react';
import { useState } from 'react';

function MobileFriendsLink() {
    const { totalAlertCount } = useUserChannel();
    const t = useTranslations();
    return (
        <Link
            href={route('friends.index')}
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-stone-600 transition hover:bg-warm hover:text-stone-900"
        >
            <span>{t('nav.friends')}</span>
            {totalAlertCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                    {totalAlertCount}
                </span>
            )}
        </Link>
    );
}

function UserDropdownBadge() {
    const { totalAlertCount } = useUserChannel();
    const t = useTranslations();
    const pageProps = usePage().props;
    const user = pageProps.auth?.user;

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <span className="relative inline-flex rounded-md">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full p-1 transition duration-150 ease-in-out hover:bg-warm focus:outline-none focus:ring-2 focus:ring-coral/30"
                    >
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-warm bg-warm text-sm font-semibold text-stone-700">
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        )}
                        {totalAlertCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
                                {totalAlertCount > 99 ? '99+' : totalAlertCount}
                            </span>
                        )}
                    </button>
                </span>
            </Dropdown.Trigger>
            <Dropdown.Content>
                {pageProps.auth?.can_switch_profile && (
                    <Dropdown.Link href={route('profile-select')}>
                        {t('profile_select.switch_profile')}
                    </Dropdown.Link>
                )}
                <Dropdown.Link href={route('friends.index')} className="flex items-center justify-between">
                    <span>{t('nav.friends')}</span>
                    {totalAlertCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                            {totalAlertCount}
                        </span>
                    )}
                </Dropdown.Link>
                <Dropdown.Link href={route('badges.index')}>{t('nav.badges')}</Dropdown.Link>
                <Dropdown.Link href={route('rewards.index')}>{t('nav.rewards')}</Dropdown.Link>
                <Dropdown.Link href={route('profile.edit')}>{t('nav.profile')}</Dropdown.Link>
                <Dropdown.Link href={route('logout')} method="post" as="button">
                    {t('nav.log_out')}
                </Dropdown.Link>
            </Dropdown.Content>
        </Dropdown>
    );
}

function LeftSidebar({ user, t }) {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-warm bg-cream lg:block">
            <nav className="sticky top-14 flex flex-col gap-1 p-3">
                <SidebarNavLink href={route('dashboard')} active={route().current('dashboard')} icon={Home}>
                    {t('nav.dashboard')}
                </SidebarNavLink>
                <SidebarNavLink href={route('think.index')} active={route().current('think.index')} icon={Brain}>
                    {t('think.title')}
                </SidebarNavLink>
                <SidebarNavLink href={route('play')} active={route().current('play')} icon={Gamepad2}>
                    {t('nav.play')}
                </SidebarNavLink>
                <SidebarNavLink href={route('compete.index')} active={route().current('compete.index')} icon={Swords}>
                    {t('compete.title')}
                </SidebarNavLink>
                <SidebarNavLink href={route('stats.index')} active={route().current('stats.index')} icon={BarChart3}>
                    {t('nav.stats')}
                </SidebarNavLink>
                <SidebarNavLink href={route('report-card.index')} active={route().current('report-card.*')} icon={FileText}>
                    {t('nav.report_card')}
                </SidebarNavLink>
                <SidebarNavLink href={route('friends.index')} active={route().current('friends.index')} icon={Users}>
                    {t('nav.friends')}
                </SidebarNavLink>
                <SidebarNavLink href={route('badges.index')} active={route().current('badges.index')} icon={Award}>
                    {t('nav.badges')}
                </SidebarNavLink>
                <SidebarNavLink href={route('rewards.index')} active={route().current('rewards.index')} icon={Gift}>
                    {t('nav.rewards')}
                </SidebarNavLink>
                {user?.parent_id === null && (
                    <SidebarNavLink href={route('family.index')} active={route().current('family.index')} icon={UsersRound}>
                        {t('nav.family')}
                    </SidebarNavLink>
                )}
                <div className="my-2 border-t border-warm" />
                <SidebarNavLink href={route('profile.edit')} active={route().current('profile.edit')} icon={UserCircle}>
                    {t('nav.profile')}
                </SidebarNavLink>
            </nav>
        </aside>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const pageProps = usePage().props;
    const user = pageProps.auth?.user;
    const t = useTranslations();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <CompetitionChannelProvider userId={user?.id}>
        <UserChannelProvider
            userId={user?.id}
            initialPendingFriendRequests={pageProps.pendingFriendRequestsCount ?? 0}
            initialUnreadNotifications={pageProps.unreadNotificationsCount ?? 0}
        >
        <div className="min-h-screen bg-cream">
            {pageProps.auth?.acting_as_child && (
                <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
                    <Link href={route('profile-select')} className="font-medium underline hover:text-amber-900">
                        {t('profile_select.playing_as', { name: user?.name })}
                    </Link>
                </div>
            )}

            {/* Top bar - Facebook style */}
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-warm bg-cream px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Link
                        href={route('dashboard')}
                        className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-warm"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-coral bg-coral text-white">
                            <BookOpen className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="hidden font-display text-lg font-semibold tracking-tight text-stone-800 sm:inline">
                            {t('game.name')}
                        </span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center px-4 lg:hidden">
                    <span className="font-display text-lg font-semibold text-stone-800">{t('game.name')}</span>
                </div>

                <div className="flex items-center gap-2">
                    <LocaleSwitcher />
                    <UserDropdownBadge />
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-stone-600 transition hover:bg-warm hover:text-stone-900 lg:hidden"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Left sidebar - desktop */}
                <LeftSidebar user={user} t={t} />

                {/* Mobile menu overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-stone-900/20 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
                <div
                    className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-warm bg-cream shadow-xl transition-transform duration-200 lg:hidden ${
                        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex h-14 items-center justify-between border-b border-warm px-4">
                        <span className="font-display text-lg font-semibold text-stone-800">{t('game.name')}</span>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-lg p-2 text-stone-600 hover:bg-warm"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-1 overflow-y-auto p-3">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            {t('nav.dashboard')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('think.index')} active={route().current('think.index')}>
                            {t('think.title')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('play')} active={route().current('play')}>
                            {t('nav.play')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('compete.index')} active={route().current('compete.index')}>
                            {t('compete.title')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('stats.index')} active={route().current('stats.index')}>
                            {t('nav.stats')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('report-card.index')} active={route().current('report-card.*')}>
                            {t('nav.report_card')}
                        </ResponsiveNavLink>
                        <MobileFriendsLink />
                        <ResponsiveNavLink href={route('badges.index')} active={route().current('badges.index')}>
                            {t('nav.badges')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('rewards.index')} active={route().current('rewards.index')}>
                            {t('nav.rewards')}
                        </ResponsiveNavLink>
                        {user?.parent_id === null && (
                            <ResponsiveNavLink href={route('family.index')} active={route().current('family.index')}>
                                {t('nav.family')}
                            </ResponsiveNavLink>
                        )}
                        <div className="my-2 border-t border-warm" />
                        {pageProps.auth?.can_switch_profile && (
                            <ResponsiveNavLink href={route('profile-select')}>
                                {t('profile_select.switch_profile')}
                            </ResponsiveNavLink>
                        )}
                        <ResponsiveNavLink href={route('profile.edit')} active={route().current('profile.edit')}>
                            {t('nav.profile')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink method="post" href={route('logout')} as="button">
                            {t('nav.log_out')}
                        </ResponsiveNavLink>
                    </nav>
                </div>

                {/* Main content - canvas area, minimal chrome */}
                <main className="min-h-[calc(100vh-3.5rem)] min-w-0 flex-1 overflow-auto bg-cream">
                    {header && (
                        <div className="border-b border-warm/60 bg-white/50 px-4 py-3 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    )}
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>

            <CompetitionInviteToast />
            <FriendRequestToast />
        </div>
        </UserChannelProvider>
        </CompetitionChannelProvider>
    );
}
