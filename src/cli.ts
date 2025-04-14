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
  .option('-t, --translationsDir <translationsDir>', 'Translations folder path', 'src/lib/i18n/translations')
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
          greetings: greetings[locale as keyof typeof greetings] || "Here's hello in " + locale + "language"
        };
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
        console.log(`Created ${filePath}`);
      } else {
        console.log(`Skipped existing ${filePath}`);
      }
    }
  }

  // --- Template File Handling ---
  console.log("Reading template files...");
  const baseTemplateDir = path.resolve(import.meta.dirname, '../', 'templates', 'basic');

  // Read i18n config template
  const i18nTemplatePath = path.join(baseTemplateDir, 'i18n.ts.tpl');
  if (!fs.existsSync(i18nTemplatePath)) {
    console.error(`Error: Template file not found at ${i18nTemplatePath}`);
    process.exit(1);
  }
  let i18nContent = fs.readFileSync(i18nTemplatePath, 'utf-8');
  console.log(`Read ${path.basename(i18nTemplatePath)}`);

  // Read core index template
  const indexTemplatePath = path.join(baseTemplateDir, 'index.svelte.ts.tpl');
   if (!fs.existsSync(indexTemplatePath)) {
    console.error(`Error: Template file not found at ${indexTemplatePath}`);
    process.exit(1);
  }
  const indexContent = fs.readFileSync(indexTemplatePath, 'utf-8');
  console.log(`Read ${path.basename(indexTemplatePath)}`);

  // Read core types template
  const typesTemplatePath = path.join(baseTemplateDir, 'types.ts.tpl');
   if (!fs.existsSync(typesTemplatePath)) {
    console.error(`Error: Template file not found at ${typesTemplatePath}`);
    process.exit(1);
  }
  const typesContent = fs.readFileSync(typesTemplatePath, 'utf-8');
  console.log(`Read ${path.basename(typesTemplatePath)}`);


  // --- Generate i18n Config File ---
  console.log("Generating i18n configuration file...");
  const localesArrayString = localesArray.map((l: string) => `'${l}'`).join(', ');

  // Replace the placeholders with actual values from options
  i18nContent = i18nContent.replace('{{LOCALES_ARRAY}}', localesArrayString);
  i18nContent = i18nContent.replace(/{{FALLBACK_LOCALE}}/g, fallbackLocale); // Use regex for global replace if needed multiple times
  i18nContent = i18nContent.replace('{{PERSIST_LOCALE}}', String(persistLocale));
  i18nContent = i18nContent.replace('{{LOCALSTORAGE_KEY}}', localStorageKey);
  i18nContent = i18nContent.replace('{{DEBUG}}', String(debug));

  // Define the output path for the i18n config file
  const i18nConfigPath = path.join('src', 'lib', "i18n" , 'i18n.ts'); // Target: src/lib/i18n.ts
  fs.mkdirSync(path.dirname(i18nConfigPath), { recursive: true }); // Ensure src/lib exists
  fs.writeFileSync(i18nConfigPath, i18nContent, 'utf-8');
  console.log(`Generated i18n config file: ${i18nConfigPath}`);


  // --- Generate Core Library Files ---
  console.log("Generating core library files...");
  const coreLibDir = path.join('src', 'lib', 'i18n', 'core'); // Target: src/lib/i18n/core
  fs.mkdirSync(coreLibDir, { recursive: true }); // Ensure src/lib/i18n/core exists

  // Write index.svelte.ts
  const coreIndexPath = path.join(coreLibDir, 'index.svelte.ts');
  fs.writeFileSync(coreIndexPath, indexContent, 'utf-8');
  console.log(`Generated core file: ${coreIndexPath}`);

  // Write types.ts
  const coreTypesPath = path.join(coreLibDir, 'types.ts');
  fs.writeFileSync(coreTypesPath, typesContent, 'utf-8');
  console.log(`Generated core file: ${coreTypesPath}`);

  console.log("\nsvelte-phrase-chain initialization complete!");
  });

  program.parse(process.argv);
}

main().catch(err => {
  console.error(err);
});
