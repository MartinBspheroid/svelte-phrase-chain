import BaseLanguage from '$lib/translations/en.json'; // Base English translations

import {setupI18n} from "./core/index.svelte"

export const locales = ['en', 'es', 'fr'] as const; 

// Define a type for available locales
export type Locale = typeof locales[number];
const { t, locale, setLocale, initLocale } = setupI18n<Locale, typeof BaseLanguage>({
    fallbackLocale: 'en',
    persistLocale: true,
    localStorageKey: 'app_locale',
    debug: true,
    loadTranslation: async (locale) => {
        // Use Vite's static analysis friendly dynamic import *in your code*
        const module = await import(`./translations/${locale}.json`);
        return module.default;
      }
}, BaseLanguage);

export { t, locale, setLocale, initLocale };