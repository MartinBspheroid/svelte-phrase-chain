// Type declarations for Svelte 5 Runes and SvelteKit
declare function $state<T>(initialValue: T): T;
declare function $derived<T>(computation: () => T): T;

declare module '$app/environment' {
  export const dev: boolean;
}

declare module '$lib/translations/*.json' {
  const content: Record<string, any>;
  export default content;
}

declare module '$lib/types' {
  export type Paths<T> = string;
}
