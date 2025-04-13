import BaseLanguage from './translations/{{FALLBACK_LOCALE}}.json'; // Base translations from fallback locale
import { setupI18n } from 'svelte-phrase-chain/core';

// Define your available locales based on the CLI input
export const locales = [{{LOCALES_ARRAY}}] as const;

// Define a type for available locales
export type Locale = typeof locales[number];

// Initialize and export i18n functions with type safety and configuration
const { t, locale, setLocale, initLocale } = setupI18n<Locale, typeof BaseLanguage>({
    fallbackLocale: '{{FALLBACK_LOCALE}}',
    persistLocale: {{PERSIST_LOCALE}},
    localStorageKey: '{{LOCALSTORAGE_KEY}}',
    debug: {{DEBUG}},
    loadTranslation: async (localeToLoad) => {
        // Use Vite's static analysis friendly dynamic import
        // Adjust the path based on your translations directory structure
        const module = await import(`./translations/${localeToLoad}.json`);
        return module.default;
      }
}, BaseLanguage);

// Re-export useful types and functions
export { t, locale, setLocale, initLocale };


// You can add custom extensions or configurations here if needed
