import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-coral/30 ' +
                (active
                    ? 'bg-coral-light text-coral'
                    : 'text-stone-600 hover:bg-warm hover:text-stone-900') +
                className
            }
        >
            {children}
        </Link>
    );
}
