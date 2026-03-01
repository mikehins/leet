import { Link } from '@inertiajs/react';

export default function SidebarNavLink({ active = false, icon: Icon, children, className = '', ...props }) {
    return (
        <Link
            {...props}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-coral/30 ${
                active
                    ? 'bg-coral-light text-coral'
                    : 'text-stone-700 hover:bg-warm hover:text-stone-900'
            } ${className}`}
        >
            {Icon && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
            )}
            <span>{children}</span>
        </Link>
    );
}
