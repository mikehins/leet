import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start rounded-lg px-4 py-3 ${
                active
                    ? 'border border-coral/40 bg-coral-light text-coral'
                    : 'text-stone-600 hover:bg-warm hover:text-stone-900'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
