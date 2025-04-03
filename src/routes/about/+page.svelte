<script lang="ts">
    import type { PageData } from './$types';
    import Readme from '../../README.md';

    let { data }: { data: PageData } = $props();
</script>

<div class="prose mx-auto mt-6">
	<Readme />
</div>