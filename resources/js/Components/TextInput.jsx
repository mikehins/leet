import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:ring-offset-0 ' +
                className
            }
            ref={localRef}
        />
    );
});
