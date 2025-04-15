# Svelte Phrase Chain

A powerful, type-safe internationalization (i18n) library for Svelte applications. Built with Svelte 5 runes and TypeScript for a modern, reactive localization experience.

[![Made with Svelte](https://img.shields.io/badge/Made%20With-Svelte-FF3E00?style=flat-square&logo=svelte)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?style=flat-square&logo=svelte)](https://svelte.dev/)


## 🛠️ CLI Quickstart

Svelte Phrase Chain uses a dedicated CLI for project initialization, ensuring a streamlined setup process.

### 1. Install via CLI
> **Note:** You can skip installing the package, as the CLI will effectively just copy paste all necessary files to your project.

```bash
# Using bun
bunx svelte-phrase-chain init

# Using npm
npx svelte-phrase-chain init

# Using pnpm
pnpx  svelte-phrase-chain init

```


The CLI accepts several options to customize your setup:

```bash
# Full example with all options
bunx svelte-phrase-chain init \
  --locales en,fr,es,de \
  --fallbackLocale en \
  --persistLocale \
  --localStorageKey app_locale \
  --translationsDir src/lib/i18n/translations \
  --generateTranslations \
  --debug
```

| Option | Description | Default |
|--------|-------------|---------|
| `--locales` | Supported locales (comma-separated) | `en,es,fr` |
| `--fallbackLocale` | Fallback locale | `en` |
| `--persistLocale` | Persist locale in localStorage | `true` |
| `--localStorageKey` | LocalStorage key for locale | `app_locale` |
| `--translationsDir` | Translations folder path | `src/lib/translations` |
| `--generateTranslations` | Generate initial translation JSON files | `true` |
| `--debug` | Enable debug logging | `true` |

### 2. Generated files

The CLI will generate:

```
src/
└── lib/
    ├── i18n/
    │   ├── i18n.ts              # Main i18n configuration & exports
    │   └── core/                # Core implementation files
    │       ├── index.svelte.ts  # Main i18n functionality
    │       └── types.ts         # TypeScript types
    └── translations/            # Translation JSON files
        ├── en.json
        ├── es.json
        └── fr.json
```

### 3. Import and use i18n in your components

```svelte
<script lang="ts">
  import { t, setLocale, locale, initLocale } from '$lib/i18n/i18n';
  import type { Locale } from '$lib/i18n/i18n';
  
  // Initialize with browser detection
  initLocale({ 
    preferBrowser: true, 
    preferStorage: true,
    defaultLocale: 'en'
  });
  
  // Example usage
  let name = $state("User");
  let messageCount = $state(1);
  
  function changeLanguage(lang: Locale) {
    setLocale(lang);
  }
</script>

<h1>{t('common.welcome')}</h1>
<p>{t('common.greeting', { name })}</p>

<p>{t('user.messageCount', { count: messageCount }, messageCount)}</p>

<!-- Language switcher -->
<div>
  <p>Current locale: {locale()}</p>
  <button onclick={() => changeLanguage('en')}>English</button>
  <button onclick={() => changeLanguage('fr')}>Français</button>
  <button onclick={() => changeLanguage('es')}>Español</button>
</div>
```

## Philosophy

Svelte Phrase Chain follows the "code is yours, do what you want with it" approach, similar to shadcn and other projects. It is designed with sensible defaults, but all you need to add is up to you:

- Want to support multiple English versions (en-gb, en-us, en-au)? Feel free to add it!
- Don't like how plurals are handled? Feel free to rewrite it!
- Need to customize anything? The code is yours to modify.

### How CLI Affects Your Code

When you run the CLI:

- Yes, it will overwrite code if you run it again in an existing project
- But as you own the code, you can validate the changes via your source control of choice
- Add and merge changes you want (especially if you've customized it to fit your needs)
- All generated code belongs to your project - modify it freely to match your requirements

## Why Svelte Phrase Chain?

While there are several i18n solutions for Svelte like svelte-i18n and typesafe-i18n, Svelte Phrase Chain offers distinct advantages:

- **Built for Svelte 5** - Leverages runes for true reactivity without stores or contexts
- **Fully Type-Safe** - TypeScript-first approach with automatic type generation from translation files
- **Modern API** - Clean, intuitive API designed for the latest Svelte development practices
- **Zero External Dependencies** - Core functionality has no runtime dependencies beyond Svelte itself
- **Fine-Grained Reactivity** - Updates only what changes, optimized for Svelte's rendering model
- **Extensible by Design** - Built with customization and extension in mind

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

## Translation File Structure

The library expects JSON files with translations for each locale:

```json
// src/lib/translations/en.json
{
  "common": {
    "welcome": "Welcome to our app",
    "greeting": "Hello, {name}!",
    "footer": "© 2025 Awesome App. All rights reserved."
  },
  "user": {
    "messageCount": {
      "zero": "No messages",
      "one": "You have {count} unread message",
      "other": "You have {count} unread messages"
    }
  }
}
```

## Advanced Usage

### Date Formatting

```svelte
<script>
  import { t } from '$lib/i18n/i18n';
  
  const joinDate = new Date('2023-01-15');
  const lastLoginDate = new Date(Date.now() - 3600000); // 1 hour ago
</script>

<!-- In your translation file: "user.joinDate": "Member since {date:date}" -->
<p>{t('user.joinDate', { date: joinDate })}</p>

<!-- In your translation file: "user.lastLogin": "Last login: {date:relative}" -->
<p>{t('user.lastLogin', { date: lastLoginDate })}</p>
```

### Pluralization

```svelte
<script>
  import { t } from '$lib/i18n/i18n';
  
  let count = $state(1);
  
  function increment() {
    count++;
  }
</script>

<!--
Translation structure in user.messageCount:
{
  "zero": "No messages",
  "one": "{count} message",
  "other": "{count} messages"
}
-->

<p>{t('user.messageCount', { count }, count)}</p>
<button on:click={increment}>Add Message</button>
```

### Schema Validation

Use the provided schema tools to validate your translation files:

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
  allowedDateFormats: ['date', 'relative', 'fullDate']
});

// Validate all translation files
try {
  const enValid = mySchema.parse(en);
  const esValid = mySchema.parse(es);
  const frValid = mySchema.parse(fr);
  console.log("✅ All translation files are valid!");
} catch (error) {
  console.error("❌ Validation failed:", error);
  process.exit(1);
}
```

## Browser Compatibility

Supports all modern browsers with ECMAScript 2015 (ES6) support, with features relying on:
- `Intl` API for formatting
- Dynamic imports for lazy loading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

* Built with Svelte 5 and TypeScript
* Inspired by modern i18n libraries like react-intl and i18next