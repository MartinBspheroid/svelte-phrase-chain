// Custom type declarations for Svelte 5 runes and SvelteKit modules
declare function $state<T>(initialValue: T): T;
declare function $derived<T>(computation: () => T): T;
declare function $effect(fn: () => void | (() => void)): void;
declare function $props<T>(): T;

declare module '$app/environment' {
  export const dev: boolean;
  export const browser: boolean;
}

declare module '$lib/translations/*.json' {
  const content: Record<string, unknown>;
  export default content;
}
