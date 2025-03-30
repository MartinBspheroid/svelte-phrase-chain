<script lang="ts">
    import {initLocale} from "$lib/i18n.svelte.js"
    import type { LayoutProps } from './$types';

let { data, children }: LayoutProps = $props();
    initLocale({
        defaultLocale : "en",
        preferBrowser : true,
        
    })
</script>

{@render children()}