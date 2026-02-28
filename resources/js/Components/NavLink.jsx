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
                'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-200 ' +
                (active
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900') +
                className
            }
        >
            {children}
        </Link>
    );
}
