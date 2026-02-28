import { usePage } from '@inertiajs/react';

/**
 * Replace :param placeholders in a translation string.
 */
function replaceParams(str, params = {}) {
    if (typeof str !== 'string') return str;
    return Object.entries(params).reduce(
        (s, [key, value]) => s.replace(new RegExp(`:${key}`, 'g'), String(value)),
        str
    );
}

/**
 * Get translation for key, with optional parameter replacement.
 * @param {string} key - Translation key (e.g. 'play.correct')
 * @param {Record<string, string|number>} [params] - Replacements for :param in the string
 * @returns {string}
 */
export function useTranslations() {
    const { translations = {} } = usePage().props;

    return (key, params = {}) => {
        const str = translations[key] ?? key;
        return replaceParams(str, params);
    };
}
