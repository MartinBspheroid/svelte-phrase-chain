/*
Build script for dist

Copy just /src/lib/core/index.svelte.ts to /dist/core/index.svelte.ts
Copy just /src/lib/core/types.ts to /dist/core/types.ts


*/

import { $ } from "bun";


await $`mkdir -p dist/core`;
await $`cp src/lib/core/index.svelte.ts dist/core/index.svelte.ts`;
await $`cp src/lib/core/types.ts dist/core/types.ts`;

