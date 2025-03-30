# Svelte Phrase Chain

A powerful, type-safe internationalization (i18n) library for Svelte applications. Built with Svelte 5 runes and TypeScript for a modern, reactive localization experience.

[![Made with Svelte](https://img.shields.io/badge/Made%20With-Svelte-FF3E00?style=flat-square&logo=svelte)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?style=flat-square&logo=svelte)](https://svelte.dev/)

## Why Svelte Phrase Chain?

While there are several i18n solutions for Svelte like svelte-i18n and typesafe-i18n, Svelte Phrase Chain offers distinct advantages:

- **Built for Svelte 5** - Leverages runes for true reactivity without stores or contexts
- **Fully Type-Safe** - TypeScript-first approach with automatic type generation from translation files
- **Modern API** - Clean, intuitive API designed for the latest Svelte development practices
- **Zero External Dependencies** - Core functionality has no runtime dependencies beyond Svelte itself
- **Fine-Grained Reactivity** - Updates only what changes, optimized for Svelte's rendering model
- **Extensible by Design** - Built with customization and extension in mind

[Try it in the Svelte REPL →](https://svelte.dev/repl)

## Features

- 🔄 **Reactive** - Built with Svelte 5 runes for automatic reactivity
- 🔍 **Type-safe** - Full TypeScript support with auto-completion for translation keys
- 🌐 **Dynamic locale switching** - Change languages on-the-fly
- 📦 **Lazy loading** - Load translation files on demand based on the active locale
- 📊 **Rich formatting options**:
  - 📝 Parameter interpolation (`Hello, {name}!`)
  - 🔢 Pluralization with count-aware formatting
  - 📅 Date formatting with relative time support
  - 🧮 Number formatting with currency and percent support
- 🧪 **Schema validation** - Zod-powered schema validation for translation files
- 🧩 **Component integration** - Svelte component for easy use in templates

## Installation

```bash
# Using npm
npm install svelte-phrase-chain

# Using pnpm
pnpm add svelte-phrase-chain

# Using yarn
yarn add svelte-phrase-chain

# Using bun
bun add svelte-phrase-chain
```

## Quick Start

### 1. Set up your translation files

Create JSON files for each language in `src/lib/translations/`:

```json
// src/lib/translations/en.json
{
  "greeting": "Hello, {name}!",
  "messages": {
    "welcome": "Welcome to our app",
    "farewell": "Goodbye!"
  },
  // Pluralization enforced by the schema validation
  "itemsCount": {
    
      "zero": "No items",
      "one": "{count} item",
      "other": "{count} items"
    
  }
}
```

### 2. Define your available locales (for type safety)

```typescript
// src/lib/i18n.ts
import { setupI18n } from 'svelte-phrase-chain';

// Define available locales to ensure type safety throughout your app
export type AppLocale = 'en' | 'es' | 'fr' | 'de'; 

// Initialize and export i18n functions with your locale type
export const { t, locale, setLocale, initLocale } = setupI18n<AppLocale>();
```

### 3. Initialize in your layout file

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { initLocale } from '$lib/i18n';
  
  // Initialize with browser detection
  initLocale({
    defaultLocale: 'en',
    preferBrowser: true,
    preferStorage: true
  });
</script>

<slot />
```

### 4. Use in your components

```svelte
<script lang="ts">
  import { t, setLocale, locale } from '$lib/i18n';
  import { Translation } from 'svelte-phrase-chain/components';
  
  let name = $state("John");
  let messageCount = $state(1);
  
  function changeLanguage(lang) {
    setLocale(lang);
  }
</script>

<h1>{t('messages.welcome')}</h1>
<p>{t('greeting', { name })}</p>


<p>{t("items.count",{ count: messageCount },  messageCount)}</p>

<!-- Language switcher -->
<div>
  <button onclick={() => changeLanguage('en')}>English</button>
  <button onclick={() => changeLanguage('fr')}>Français</button>
  <button onclick={() => changeLanguage('es')}>Español</button>
</div>

<p>Current locale: {locale()}</p>
```

## Lazy Loading

Translation files are loaded on demand when you switch to a new locale. The English locale (`en`) is typically bundled by default, while other locales are loaded dynamically:

```svelte
<script>
  import { setLocale } from '$lib/i18n';
  
  // When this function is called, the Spanish translation file will be
  // dynamically imported only if it hasn't been loaded before
  async function switchToSpanish() {
    await setLocale('es');
    console.log('Spanish translations loaded');
  }
</script>
```


## Advanced Configuration

### Configure Options

The complete set of configuration options:

```typescript
import { configure } from '$lib/i18n';

configure({
  // Storage options
  persistLocale: true,           // Store locale preference in localStorage
  localStorageKey: 'app_locale', // Custom storage key
  
  // Locale options
  fallbackLocale: 'en',          // Default fallback when a translation is missing
  
  // Debug options
  debug: true,                   // Enable verbose logging (defaults to true in dev mode)
  
  // Advanced formatting
  dateFormats: {                 // Custom date formats
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  },
  
  // Error handling
  missingKeyHandler: (key, locale) => {
    // Custom handling for missing translation keys
    console.warn(`Missing translation: ${key} in ${locale}`);
    return `[${key}]`; // Default return value
  }
});
```


### Schema Validation

Create a schema for your translation files to ensure consistency:

```typescript
// scripts/validate-translations.ts
import { createI18nSchema } from 'svelte-phrase-chain/schema';
import en from '../src/lib/translations/en.json';
import es from '../src/lib/translations/es.json';
import fr from '../src/lib/translations/fr.json';

const mySchema = createI18nSchema({
  pluralKeyIdentifier: (key) => key.endsWith('Count'),
  requiredPluralKeys: ['one', 'other'],
  optionalPluralKeys: ['zero', 'few', 'many'],
  allowedDateFormats: ['date', 'relative', 'fullDate'],
  validateAllPlaceholdersSyntax: true
});

// Validate all translation files
try {
  const enValid = mySchema.parse(en);
  const esValid = mySchema.parse(es);
  const frValid = mySchema.parse(fr);
  console.log("✅ All translation files are valid!");
} catch (error) {
  console.error("❌ Validation failed:", error);
  process.exit(1); // Exit with error code for CI/CD pipelines
}
```

Run this validation as part of your build process or CI/CD pipeline:

```json
// package.json
{
  "scripts": {
    "validate-translations": "bun run scripts/validate-translations.ts",
    "build": "bun run validate-translations && vite build"
  }
}
```

## Error Handling & Fallback Behavior

Svelte Phrase Chain uses a multi-level fallback strategy to ensure your app never breaks due to missing translations:

1. **Missing Key in Current Locale**: Falls back to the same key in the fallback locale
2. **Missing Key in Fallback Locale**: Shows a formatted version of the key itself
3. **Invalid Plural Form**: Falls back to the 'other' form if available
4. **Formatting Error**: Shows the raw parameter value

Debug mode provides detailed warnings in the console for:
- Missing translation keys
- Fallbacks being used
- Formatting errors
- Invalid parameter types

## API Reference

### Core Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `t(key, params?, count?)` | Translate a key with optional parameters and count | `key`: Translation key<br>`params?`: Optional parameters for interpolation<br>`count?`: Optional number for pluralization |
| `locale()` | Get the current locale | None |
| `setLocale(locale, options?)` | Set the active locale | `locale`: Locale to set<br>`options?`: `{ silent?: boolean }` |
| `initLocale(options?)` | Initialize the locale | `options?`: `{ preferBrowser?: boolean, preferStorage?: boolean, defaultLocale?: Locale }` |
| `configure(options)` | Configure global i18n behavior | See [Configuration Options](#configure-options) |
| `detectBrowserLocale()` | Utility to detect the user's browser locale | None |
| `preloadTranslation(locale)` | Preload a translation file | `locale`: Locale to preload |

### Components

| Component | Props | Description |
|-----------|-------|-------------|
| `Translation` | `key`: Translation key<br>`params?`: Parameters for interpolation<br>`count?`: Number for pluralization<br>`tag?`: HTML element tag (default: 'span') | Svelte component for translations |

## Advanced Usage Examples

### Date Formatting

```svelte
<script>
  import { t } from '$lib/i18n';
  
  const joinDate = new Date('2023-01-15');
  const lastLoginDate = new Date(Date.now() - 3600000); // 1 hour ago
</script>

<!-- In your translation file: "user.joinDate": "Member since {date:date}" -->
<p>{t('user.joinDate', { date: joinDate })}</p>

<!-- In your translation file: "user.lastLogin": "Last login: {date:relative}" -->
<p>{t('user.lastLogin', { date: lastLoginDate })}</p>

<!-- Custom date format -->
<!-- "event.time": "Event at {date:fullDate}" -->
<p>{t('event.time', { date: new Date() })}</p>
```

### Pluralization with Complex Rules

```svelte
<script>
  import { t } from '$lib/i18n';
  
  let count = $state(1);
  
  function increment() {
    count++;
  }
</script>

<!--
Translation structure:
{
  "items": {
    "zero": "No items",
    "one": "{count} item",
    "few": "{count} items (few)",
    "many": "{count} items (many)",
    "other": "{count} items"
  }
}
-->

<p>{t('items', { count }, count)}</p>
<button on:click={increment}>Add Item</button>
```

### Number Formatting

```svelte
<script>
  import { t } from '$lib/i18n';
  
  const price = 1234.56;
  const percent = 0.7523;
</script>

<!-- In your translation file: "product.price": "Price: {amount:currency}" -->
<p>{t('product.price', { amount: price })}</p> <!-- "Price: $1,234.56" -->

<!-- In your translation file: "stats.completion": "Completion: {value:percent}" -->
<p>{t('stats.completion', { value: percent })}</p> <!-- "Completion: 75.23%" -->
```

## Browser Compatibility

Supports all modern browsers with ECMAScript 2015 (ES6) support, features rely on:
- `Intl` API for formatting
- Dynamic imports for lazy loading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request

## Future Plans

The following features are planned for future releases:

* **Import/Export** - Custom functions to import and export translations from different formats (PO, XLIFF, CSV)
* **Statistics and Diagnostics** - Tools to generate statistics and diagnostics based on existing translations
* **VSCode Extension** - Dedicated VSCode extension for better tooling and developer experience
* **Message extraction** - Automatically extract messages from source code
* **Translation Memory** - Save and suggest translations based on previous work

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

* Built with Svelte 5 and TypeScript
* Inspired by modern i18n libraries like react-intl and i18next