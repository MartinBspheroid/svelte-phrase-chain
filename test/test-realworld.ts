import { $ } from "bun";
import * as fs from 'node:fs/promises';

console.log("Step 0: Bundle test-app");
await $`bun run build`;
await $`bun run build:cli`;

console.log("Step 1: Creating and navigating into test-app directory");
await $`rm -rf test-app`.nothrow();
await fs.mkdir('test-app', { recursive: true });
process.chdir('test-app');

console.log("Step 2: Scaffolding SvelteKit project");
await $`bunx sv create . --template minimal --types ts --no-add-ons --install bun`;

console.log("Step 3: Installing dependencies");
await $`bun link svelte-phrase-chain`;


console.log("Step 5: Running svelte-phrase-chain init");
await $`bun svelte-phrase-chain init \
  --locales en,fr,es \
  --fallbackLocale en \
  --persistLocale \
  --localStorageKey app_locale \
  --translationsDir src/lib/translations \
  --generateTranslations \
  --debug`;

console.log("Step 6: Dist directory to node_modules instead of installing it from  registry");

process.chdir("..");

console.log("Step 6: Replacing src/routes/+page.svelte with an empty file");

const pageTemplate = await Bun.file("test/page.template").text();
await Bun.write("test-app/src/routes/+page.svelte", pageTemplate);

console.log("Step 7: Setup complete. To run the app, execute: cd test-app && bun run dev");