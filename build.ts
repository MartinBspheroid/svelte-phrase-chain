/*
Build script for distribution

1. Build the CLI tool (`src/cli.ts`) into `dist/cli.js`.
2. Create template files (`.tpl`) from core library files (`src/lib/core/*`)
   and place them in `templates/basic/`.

These templates will be used by the CLI to scaffold new projects.
*/

import { $ } from "bun";


// Ensure dist and templates directories exist
await $`mkdir -p dist`;
await $`mkdir -p templates/basic`;

// Build the CLI
console.log("Building CLI...");
await $`bun build src/cli.ts --outfile dist/cli.js --target node --minify`;
console.log("CLI build complete.");

// Copy core files to templates
console.log("Creating template files...");
await $`cp src/lib/core/index.svelte.ts templates/basic/index.svelte.ts.tpl`;
await $`cp src/lib/core/types.ts templates/basic/types.ts.tpl`;
console.log("Template files created.");
