<script>
    import { t } from '$lib/i18n.svelte';
    
    // Define props with Svelte 5 syntax
    export let key;
    export let params = {};
    export let count = undefined;
    export let tag = 'span';
    
    // Derive the translation from the props
    $: translation = t(key, params, count);
  </script>
  
  {#if tag === 'span'}
    <span>{translation}</span>
  {:else if tag === 'div'}
    <div>{translation}</div>
  {:else if tag === 'p'}
    <p>{translation}</p>
  {:else if tag === 'h1'}
    <h1>{translation}</h1>
  {:else if tag === 'h2'}
    <h2>{translation}</h2>
  {:else if tag === 'h3'}
    <h3>{translation}</h3>
  {:else if tag === 'label'}
    <label>{translation}</label>
  {:else if tag === 'button'}
    <button>{translation}</button>
  {:else}
    <!-- Default to a regular span if tag is not recognized -->
    <span>{translation}</span>
  {/if}