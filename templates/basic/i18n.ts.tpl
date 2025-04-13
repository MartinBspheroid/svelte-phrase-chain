import { setupI18n } from 'svelte-phrase-chain/core';
import { i18nConfig } from './i18n-config';

// Define your available locales
export type Locale = {{LOCALES}};

// Initialize and export i18n functions with type safety
export const { t, locale, setLocale, initLocale } = setupI18n<Locale>(i18nConfig);

// Re-export useful types
export type { TranslationKey } from 'svelte-phrase-chain/core';

// You can add custom extensions or configurations here