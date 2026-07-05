<script lang="ts">
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import HeadmasterMark from '$lib/components/headmaster/HeadmasterMark.svelte';

	let selected = '';
</script>

<nav
	aria-label="App navigation"
	class="min-w-[4.5rem] bg-gray-50 dark:bg-gray-950 flex gap-2.5 flex-col pt-8 border-r border-gray-200/60 dark:border-white/10"
>
	<div class="flex justify-center relative">
		{#if selected === 'home'}
			<div class="absolute top-0 left-0 flex h-full">
				<div class="my-auto rounded-r-lg w-1 h-8 headmaster-primary-button"></div>
			</div>
		{/if}

		<Tooltip content="Headmaster home" placement="right">
			<button
				aria-label="Headmaster home"
				class="cursor-pointer {selected === 'home' ? 'rounded-2xl' : 'rounded-full'}"
				on:click={() => {
					selected = 'home';

					if (window.electronAPI) {
						window.electronAPI.load('home');
					}
				}}
			>
				<HeadmasterMark className="size-11 p-0.5" />
			</button>
		</Tooltip>
	</div>

	<div class="-mt-1 border-[1.5px] border-gray-100 dark:border-gray-900 mx-4"></div>

	<div class="flex justify-center relative group">
		{#if selected === ''}
			<div class="absolute top-0 left-0 flex h-full">
				<div class="my-auto rounded-r-lg w-1 h-8 headmaster-primary-button"></div>
			</div>
		{/if}
		<Tooltip content="Open WebUI chat" placement="right">
			<button
				aria-label="Open WebUI chat"
				class="cursor-pointer bg-transparent {selected === '' ? 'rounded-2xl' : 'rounded-full'}"
				on:click={() => {
					selected = '';
				}}
			>
				<HeadmasterMark className="size-10" />
			</button>
		</Tooltip>
	</div>
</nav>
