#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

/// "greetings" in 25 languages for starters
const greetings = {
  en: 'Hello',
  es: 'Hola',
  fr: 'Bonjour',
  de: 'Hallo',
  cs: 'Ahoj',
  ru: 'Привет',
  pt: 'Olá',
  it: 'Ciao',
  nl: 'Hallo',
  pl: 'Witaj',
  tr: 'Merhaba',
  hu: 'Szia',
  sv: 'Hej',
  ro: 'Bună',
  bg: 'Здравей',
  da: 'Hej',
  no: 'Hei',
  fi: 'Hei',
  sl: 'Pozdravljeni',
  uk: 'Привіт',
  ca: 'Hola',
  ar: 'مرحبا',
  el: 'Γεια σας',
  id: 'Halo',
  th: 'สวัสดี',
  zh : '你好',

}

async function main() {
  const program = new Command();

  program
  .name('svelte-phrase-chain')
  .description('CLI to initialize svelte-phrase-chain')
  .version('0.0.3-beta.4');

  program.command('init')
  .description('Initializes svelte-phrase-chain with default settings')
  .option('-l, --locales <locales>', 'Enter supported locales (comma-separated)', 'en,es,fr')
  .option('-f, --fallbackLocale <fallbackLocale>', 'Enter fallback locale', 'en')
  .option('-p, --persistLocale', 'Persist locale in localStorage', true)
  .option('-k, --localStorageKey <localStorageKey>', 'LocalStorage key for locale', 'app_locale')
  .option('-t, --translationsDir <translationsDir>', 'Translations folder path', 'src/lib/translations')
  .option('-g, --generateTranslations', 'Generate initial translation JSON files', true)
  .option('-d, --debug', 'Enable debug logging', true)
  .action(async (options: {
    locales: string;
    fallbackLocale: string;
    persistLocale: boolean;
    localStorageKey: string;
    translationsDir: string;
    generateTranslations: boolean;
    debug: boolean;
  }) => {

  const { locales, fallbackLocale, persistLocale, localStorageKey, translationsDir, generateTranslations, debug } = options;

  console.log('Welcome to svelte-phrase-chain init!');



  
  const localesArray: string[] = locales.split(',').map((s: string) => s.trim()).filter(Boolean);

  // Ensure translations directory exists
  if (!fs.existsSync(translationsDir)) {
    fs.mkdirSync(translationsDir, { recursive: true });
    console.log(`Created translations directory: ${translationsDir}`);
  }

  // Generate initial translation files
  if (generateTranslations) {
    for (const locale of localesArray) {
      const filePath = path.join(translationsDir, `${locale}.json`);
      if (!fs.existsSync(filePath)) {
        const content = {
          greeting: greetings[locale as keyof typeof greetings] || "Here's hello in " + locale + "language"
        };
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
        console.log(`Created ${filePath}`);
      } else {
        console.log(`Skipped existing ${filePath}`);
      }
    }
  }

  // Generate i18n.svelte.ts content
  const localeUnion = localesArray.map((l: string) => `'${l}'`).join(' | ');

  // Read the template file
  const templatePath = path.join(process.cwd(), '..', 'templates', 'basic', 'i18n.ts.tpl');
  let i18nContent = fs.readFileSync(templatePath, 'utf-8');

  // Replace the placeholders with actual values
  i18nContent = i18nContent.replace('{{LOCALES}}', localeUnion);

  // Read the i18n-config template file
  const configTemplatePath = path.join(process.cwd(), '..', 'templates', 'basic', 'i18n-config.ts.tpl');
  let i18nConfigContent = fs.readFileSync(configTemplatePath, 'utf-8');

  // Replace the placeholders with actual values
  i18nConfigContent = i18nConfigContent.replace('{{PERSIST_LOCALE}}', String(persistLocale));
  i18nConfigContent = i18nConfigContent.replace('{{LOCALSTORAGE_KEY}}', localStorageKey);
  i18nConfigContent = i18nConfigContent.replace('{{FALLBACK_LOCALE}}', fallbackLocale);
  i18nConfigContent = i18nConfigContent.replace('{{DEBUG}}', String(debug));

  const i18nConfigPath = path.join('src', 'lib', 'i18n-config.ts');
  fs.mkdirSync(path.dirname(i18nConfigPath), { recursive: true });
  fs.writeFileSync(i18nConfigPath, i18nConfigContent, 'utf-8');
  console.log(`Generated ${i18nConfigPath}`);

  const i18nPath = path.join('src', 'lib', 'i18n.svelte.ts');
  fs.mkdirSync(path.dirname(i18nPath), { recursive: true });
  fs.writeFileSync(i18nPath, i18nContent, 'utf-8');
  console.log(`Generated ${i18nPath}`);
  });

  program.parse(process.argv);
}

main().catch(err => {
  console.error(err);
});
