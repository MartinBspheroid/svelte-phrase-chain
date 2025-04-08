
// src/lib/i18n.svelte.ts
import { dev } from "$app/environment";
import en from '$lib/translations/en.json'; // Base English translations
import type { Paths } from "./types";

// --- Type Definitions ---

// Define a type for available locales
export type Locale = 'en' | 'es' | 'fr';

// Configuration options interface
export interface I18nConfig {
  persistLocale: boolean;
  localStorageKey: string;
  fallbackLocale: Locale;
  debug: boolean;
}

// Type for the structure of a single translation file (matches en.json)
// It allows nested objects, strings, and specific plural objects.
export type TranslationValue = string | PluralObject | NestedTranslations;
export interface PluralObject {
  [pluralForm: string]: string; // e.g., "zero", "one", "other"
}
export type NestedTranslations = {
  [key: string]: TranslationValue;
} 

// Type for the complete translations object
// Make all locales except 'en' optional since they're lazy-loaded
type Translations = Record<Locale, Paths<typeof en>>;

export type TranslationKey = Paths<typeof en>;

// Options for initializing the locale
export interface InitLocaleOptions {
  preferBrowser?: boolean;
  preferStorage?: boolean;
  defaultLocale?: Locale;
}

// Options for setting the locale manually
export interface SetLocaleOptions {
  silent?: boolean; // Suppress console errors on load failure
}

// Options for the i18n Svelte action
export interface I18nActionOptions {
  key: string;
  params?: Record<string, unknown>;
  count?: number;
}

// --- Configuration ---

// Default configuration
const config: I18nConfig = {
  persistLocale: true,
  localStorageKey: 'app_locale',
  fallbackLocale: 'en',
  debug: dev, // Enable debug logging in development mode
};

// --- State and Derived Values ---

// Dynamically imported translations store
// Initially only contains 'en', others are loaded on demand.
// Use type assertion here to reconcile the provided type `Translations`
// with the actual structure being stored ({ en: object }).
const translations = $state<Translations>({
  en
} as unknown as Translations);

// Reactive state for the current locale (with localStorage persistence)
// Initialized by checking saved locale or using fallback.
let currentLocale = $state<Locale>(getSavedLocale());

export const locale = () => currentLocale;

// Reactive state for tracking failed locale loading attempts
const failedLocaleLoads = $state<Partial<Record<Locale, boolean>>>({});

// --- Helper Functions ---

// Type guard for locale validation
function isValidLocale(locale: string | null | undefined): locale is Locale {
  return typeof locale === 'string' && (['en', 'es', 'fr'] as string[]).includes(locale);
}

// Helper to get saved locale from localStorage or return fallback
function getSavedLocale(): Locale {
  if (config.persistLocale && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(config.localStorageKey);
      if (isValidLocale(saved)) {
        return saved;
      }
    } catch (e) {
       if (config.debug) {
        console.error("Failed to read locale from localStorage:", e);
       }
      // Ignore storage errors
    }
  }
  return config.fallbackLocale;
}

// Browser language detection helper
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return config.fallbackLocale; // Return fallback if navigator is not available (SSR)
  }
  const browserLang = navigator.language.split('-')[0];
  return isValidLocale(browserLang) ? browserLang : config.fallbackLocale;
}

// Get a nested value from an object using dot notation safely
function getNestedValue(obj: NestedTranslations | undefined, path: string): TranslationValue | undefined {
    if (!obj) return undefined;
    return path.split('.').reduce<TranslationValue | undefined>((prev, curr) => {
        // Check if prev is an object and has the current key
        if (typeof prev === 'object' && prev !== null && !Array.isArray(prev) && !(prev instanceof Date) && curr in prev) {
            // Type assertion needed because TS can't infer structure within reduce
            return (prev as NestedTranslations)[curr];
        }
        return undefined; // Path broken or value not found
    }, obj as TranslationValue);
}

// Helper to find translation value, handling fallback
function findTranslationValue(
    key: string, 
    primaryLocale: Locale, 
    fallbackLocale: Locale,
    allTranslations: Translations // Pass the whole state
): TranslationValue | undefined {
    // Use type assertion here due to the restrictive `Translations` type
    const primaryObj = allTranslations[primaryLocale] as unknown as NestedTranslations | undefined;
    let value = getNestedValue(primaryObj, key);

    if (value === undefined && primaryLocale !== fallbackLocale) {
        // Use type assertion for fallback as well
        const fallbackObj = allTranslations[fallbackLocale] as unknown as NestedTranslations | undefined;
        value = getNestedValue(fallbackObj, key);
        if (config.debug && value !== undefined) {
            console.warn(`Translation key '${key}' not found in '${primaryLocale}', using fallback '${fallbackLocale}'.`);
        }
    }
    return value;
}


// Enhanced parameter replacement with support for advanced formatting
function applyParams(str: string, params?: Record<string, unknown>): string {
  if (!params) return str;

  return str.replace(/{([^{}]+)}/g, (match, expr: string) => {
    const parts = expr.trim().split(':');
    const key = parts[0].trim();
    const formatType = parts.length > 1 ? parts[1].trim() : null;

    // Check if param exists using hasOwnProperty for safety
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];

      // Handle null or undefined explicitly
      if (value === null || value === undefined) {
        return ''; // Render empty string for null/undefined params
      }

      // Date formatting
      const isDateLike = value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(String(value)))) || typeof value === 'number';
      if (formatType && isDateLike) {
        try {
          const dateValue = value instanceof Date ? value : new Date(value as string | number);
          if (isNaN(dateValue.getTime())) throw new Error("Invalid Date"); // Avoid formatting invalid dates

          switch (formatType) {
            case 'date':
              return dateValue.toLocaleDateString(currentLocale);
            case 'time':
              return dateValue.toLocaleTimeString(currentLocale);
            case 'datetime':
              return dateValue.toLocaleString(currentLocale);
            case 'relative': {
               // Basic relative time (consider using a library like date-fns for complex cases)
               const now = new Date();
               const diffMs = now.getTime() - dateValue.getTime();
               const diffSec = Math.round(diffMs / 1000);
               const diffMin = Math.round(diffSec / 60);
               const diffHour = Math.round(diffMin / 60);
               const diffDay = Math.round(diffHour / 24);
               
               if (diffSec < 60 && diffSec >= 0) return t('relativeTime.justNow', undefined, undefined) || 'just now'; // Example: Use translation key for "just now"
               if (diffMin < 60 && diffMin > 0) return t('relativeTime.minutesAgo', { count: diffMin }, diffMin) || `${diffMin}m ago`;
               if (diffHour < 24 && diffHour > 0) return t('relativeTime.hoursAgo', { count: diffHour }, diffHour) || `${diffHour}h ago`;
               if (diffDay < 30 && diffDay > 0) return t('relativeTime.daysAgo', { count: diffDay }, diffDay) || `${diffDay}d ago`;
               // Add past/future logic if needed
               return dateValue.toLocaleDateString(currentLocale); // Fallback for older dates
            }
            default:
              // Try to use as Intl.DateTimeFormat options (if JSON-like)
              if (typeof formatType === 'string' && formatType.charAt(0) === '{' && formatType.charAt(formatType.length - 1) === '}') {
                try {
                  const options = JSON.parse(formatType);
                  return new Intl.DateTimeFormat(currentLocale, options).format(dateValue);
                } catch (e) {
                  if (config.debug) console.warn(`Invalid date format options: ${formatType}`, e);
                  // Fall through to default
                }
              }
              // Fallback to default locale string if formatType is unrecognized
              return dateValue.toLocaleString(currentLocale);
          }
        } catch (e) {
           if (config.debug) console.warn(`Error formatting date value for key "${key}":`, value, e);
           return String(value); // Return original value on formatting error
        }
      }

      // Number formatting
      if (typeof value === 'number') {
        try {
            if (formatType) {
                let options: Intl.NumberFormatOptions = {};
                const currencyCode = 'USD'; // Default currency, can be made configurable

                // Simple format keywords
                switch (formatType) {
                    case 'integer':
                        options = { maximumFractionDigits: 0 };
                        break;
                    case 'percent':
                         options = { style: 'percent' };
                         // Intl expects 0.5 for 50%, adjust if input is 50 for 50%
                         // Assuming input is fractional (e.g., 0.5), otherwise: value = value / 100;
                        break;
                    case 'currency':
                        options = { style: 'currency', currency: currencyCode };
                        break;
                    default: {
                        // Check if formatType is a number (for fixed digits)
                        const precision = parseInt(formatType, 10);
                        if (!isNaN(precision) && precision >= 0) {
                            options = {
                                minimumFractionDigits: precision,
                                maximumFractionDigits: precision
                            };
                        } else if (typeof formatType === 'string' && formatType.charAt(0) === '{' && formatType.charAt(formatType.length - 1) === '}') {
                            // Try parsing as JSON Intl options
                             try {
                                options = JSON.parse(formatType);
                                if(options.style === 'currency' && !options.currency) {
                                    options.currency = currencyCode; // Add default currency if missing
                                }
                             } catch(e) {
                                if (config.debug) console.warn(`Invalid number format options: ${formatType}`, e);
                                // Fall through to default locale string
                             }
                        }
                         // else: Unrecognized format, use default toLocaleString
                    } // End of default block scope
                }
                 return new Intl.NumberFormat(currentLocale, options).format(value);
            }
            // Default number formatting
            return value.toLocaleString(currentLocale);
        } catch(e) {
             if (config.debug) console.warn(`Error formatting number value for key "${key}":`, value, e);
             return String(value); // Return original value on formatting error
        }
      }

      // Array formatting (simple join or Intl.ListFormat if available)
      if (Array.isArray(value)) {
        const stringValues = value.map(item => String(item)); // Ensure all items are strings
        // Check if Intl.ListFormat is supported before using it
        if (formatType === 'list' && typeof Intl !== 'undefined' && 'ListFormat' in Intl) {
          try {
            // Now we know ListFormat exists, so we can type it correctly
            const formatter = new Intl.ListFormat(currentLocale);
            return formatter.format(stringValues);
          } catch (e) {
             if (config.debug) console.warn(`Error using Intl.ListFormat for key "${key}":`, value, e);
             // Fall through to comma-separated list if ListFormat fails unexpectedly
          }
        }
        // Fallback if ListFormat is not supported or formatType is not 'list'
        return stringValues.join(', ');
      }

      // Default: convert value to string
      return String(value);
    }

    // Keep the placeholder if param not found, with clear indication in debug mode
    if (config.debug) {
      return `[missing_param:${key}]`;
    }
    // In production, return the original placeholder or an empty string
    // return match; // Option 1: Keep placeholder e.g., {count}
    return ''; // Option 2: Remove placeholder if param missing
  });
}

// --- Public API ---

/**
 * Configure the i18n system. Call this before initialization if needed.
 * @param options - Partial configuration object to override defaults.
 */
export function configure(options: Partial<I18nConfig>): void {
  // Use manual property assignment instead of Object.assign
  if (options.persistLocale !== undefined) config.persistLocale = options.persistLocale;
  if (options.localStorageKey !== undefined) config.localStorageKey = options.localStorageKey;
  if (options.fallbackLocale !== undefined) config.fallbackLocale = options.fallbackLocale;
  
  // Re-evaluate debug setting based on potential override
  config.debug = options.debug !== undefined ? options.debug : dev;
}

/**
 * Initialize the locale based on storage, browser settings, or defaults.
 * Should be called once when the application starts (e.g., in layout.svelte).
 * @param options - Initialization preferences.
 */
export function initLocale(options: InitLocaleOptions = {}): void {
  const opts: Required<InitLocaleOptions> = {
    preferBrowser: true,
    preferStorage: true,
    defaultLocale: config.fallbackLocale,
    ...options
  };

  let detectedLocale: Locale | null = null;

  // 1. Check localStorage if preferred and enabled
  if (opts.preferStorage && config.persistLocale) {
    const saved = getSavedLocale(); // getSavedLocale already handles fallback internally
    // If saved locale is different from default fallback, use it
    if (saved !== config.fallbackLocale) {
        detectedLocale = saved;
    }
  }

  // 2. Fall back to browser detection if preferred and no storage locale found
  if (!detectedLocale && opts.preferBrowser) {
    const browserLocale = detectBrowserLocale();
     // Use browser locale only if it's valid and different from the fallback
     // to avoid unnecessary preference for 'en' if fallback is also 'en'.
    if (browserLocale !== config.fallbackLocale) {
        detectedLocale = browserLocale;
    }
  }

  // 3. Use detected locale or the default/fallback locale
  // Use setLocale to handle dynamic loading if necessary. 'silent' prevents errors on initial load failure.
  void setLocale(detectedLocale ?? opts.defaultLocale, { silent: true });

  if (config.debug) {
    console.log(`i18n initialized. Locale set to: ${currentLocale}. Strategy: ${detectedLocale ? (opts.preferStorage && localStorage.getItem(config.localStorageKey) ? 'Storage' : 'Browser') : 'Default/Fallback'}`);
  }
}

/**
 * Set the application locale manually. Loads the required translation file dynamically.
 * @param newLocale - The locale to set.
 * @param options - Options like suppressing errors.
 */
export async function setLocale(newLocale: Locale, options: SetLocaleOptions = {}): Promise<void> {
  const { silent = false } = options;

  // Don't retry loading failed locales immediately unless forced (silent doesn't force)
  if (failedLocaleLoads[newLocale]) {
    const message = `Locale '${newLocale}' previously failed to load. Using fallback locale '${config.fallbackLocale}' instead.`;
    if (!silent) {
      console.warn(message);
    }
    // Ensure fallback is set if the failed locale was the target
    if (currentLocale === newLocale) {
        currentLocale = config.fallbackLocale;
    }
    return; // Exit early
  }

  // Optimistically set the locale state. UI will update, showing keys/fallbacks until loaded.
  currentLocale = newLocale;

  // Load translation if it's not 'en' and not already loaded
  if (newLocale !== 'en' && !translations[newLocale]) {
    if (config.debug) {
      console.log(`Loading translations for locale: ${newLocale}`);
    }
    try {
      // Use dynamic import to load the JSON file
      const module = await import(`./translations/${newLocale}.json`);
      // Store the loaded translations (module.default assumes Vite/Rollup JSON handling)
      // Use type assertion here as well, consistent with the state initialization.
      translations[newLocale] = module.default as unknown as Paths<typeof en>;

      // Clear from failed cache if it was there before
      if (failedLocaleLoads[newLocale]) {
        failedLocaleLoads[newLocale] = false; // Reset failure flag
      }

      // If the current locale is still the one we just loaded,
      // reactivity should update automatically via $derived(currentTranslations).
      // No need to re-assign `currentLocale` here.

      if (config.debug) {
        console.log(`Successfully loaded locale: ${newLocale}`);
      }

    } catch (error) {
      // Mark locale as failed to prevent repeated attempts
      failedLocaleLoads[newLocale] = true;

      const errorMessage = `Failed to load translations for locale: ${newLocale}`;
      if (!silent) {
        console.error(errorMessage, error);
      }
      // Log to external service if available
      // if (typeof window !== 'undefined' && window.myErrorTrackingService) {
      //   window.myErrorTrackingService.captureException(error, { extra: { locale: newLocale } });
      // }

      // IMPORTANT: Fallback to the configured fallback locale if the desired locale fails
      // Check if the currently set locale is the one that failed
      if (currentLocale === newLocale) {
           currentLocale = config.fallbackLocale;
           if (!silent) {
                console.warn(`Falling back to locale: ${config.fallbackLocale}`);
           }
      }
    }
  } else if (translations[newLocale]) {
     // Locale already loaded, reactivity handles the update via currentLocale change.
     if (config.debug) {
        console.log(`Locale switched to already loaded: ${newLocale}`);
     }
  }
   // If newLocale is 'en', no loading needed, reactivity handles the update.
}

/**
 * Translates a given key using the current locale.
 * Supports nested keys (dot notation), parameter interpolation, and pluralization.
 *
 * @param key - Translation key (e.g., 'greeting', 'user.profile.title').
 * @param params - Optional parameters for interpolation (e.g., { name: 'John' }).
 * @param count - Optional count for pluralization.
 * @returns The translated string, or a fallback representation if not found.
 */
export function t(
  key: Translations[Locale], // Keep this type for the input key
  params?: Record<string, unknown>,
  count?: number
): string {
  const localeToUse = currentLocale; // Capture current locale for consistency

  // 1. Find the translation value using the new helper
  const translationValue = findTranslationValue(key, localeToUse, config.fallbackLocale, translations);

  // 2. Handle the found value (string, plural object, or undefined)
  if (translationValue !== undefined) {
    // Handle plural forms if count is provided and value is an object
    if (typeof translationValue === 'object' && translationValue !== null && count !== undefined) {
      // Handle pluralization using simple logic for older browsers/environments
      const pluralForm = (translationValue as PluralObject)[count === 1 ? 'one' : 'other'] ?? 
                         (translationValue as PluralObject)['other'];

      if (typeof pluralForm === 'string') {
        // Apply params, ensuring 'count' is available if needed (e.g., "{count} items")
        return applyParams(pluralForm, { ...params, count });
      } else {
         // Plural form for the rule/other not found
         if (config.debug) {
            console.warn(`Plural form not found for key '${key}' in locale '${localeToUse}'.`);
         }
         // Fall through to return key representation
      }
    }
    // Handle simple string translation
    else if (typeof translationValue === 'string') {
      return applyParams(translationValue, params);
    }
    // Handle case where value is an object but no count provided (or it's not a PluralObject)
    else if (config.debug) {
         console.warn(`Translation for key '${key}' in locale '${localeToUse}' is an object but used without 'count' for pluralization or is not a simple string.`);
         // Fall through
    }
  }

  // 4. Fallback if translation not found in current or fallback locale
  if (config.debug) {
    // Log missing key in development for easier debugging
    console.warn(`Translation key not found: '${key}' (locale: ${localeToUse}, fallback attempted: ${localeToUse !== config.fallbackLocale})`);

    // Optional: Collect missing keys globally for reporting
    if (typeof window !== 'undefined') {
      if (!(window).__i18nMissingKeys) {
        (window).__i18nMissingKeys = new Set<string>();
      }
      (window).__i18nMissingKeys.add(`${localeToUse}:${key}`);
    }
     // Show key clearly in development
     return `[${key}]`;
  }

  // In production, return the last part of the key as a minimal fallback
  const parts = key.split('.');
  return parts[parts.length - 1] || key;
}

// --- Type Augmentation for Global ---
// Needed for window.__i18nMissingKeys if used

declare global {
  interface Window {
    __i18nMissingKeys?: Set<string>;
    // Add other global error tracking if needed
    // myErrorTrackingService?: { captureException: (error: Error, context: any) => void };
  }
}
