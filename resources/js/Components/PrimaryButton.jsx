export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg border border-coral bg-coral px-6 py-2.5 text-sm font-medium text-white transition duration-150 ease-in-out hover:bg-coral-hover focus:outline-none focus:ring-2 focus:ring-coral/50 focus:ring-offset-2 active:bg-coral-hover ${
                    disabled && 'cursor-not-allowed opacity-50'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
