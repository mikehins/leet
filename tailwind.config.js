import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', ...defaultTheme.fontFamily.sans],
                display: ['Fredoka', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                cream: '#fef7e6',
                warm: '#f5ecd6',
                coral: {
                    DEFAULT: '#e07a5f',
                    hover: '#c96a52',
                    light: '#fdf0ed',
                },
                sage: {
                    DEFAULT: '#81b29a',
                    light: '#e8f0ec',
                },
                mustard: '#f2cc8f',
                brown: '#3d3530',
            },
        },
    },

    plugins: [forms],
};
