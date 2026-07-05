<script lang="ts">
	export let className = 'size-8';
</script>

<svg
	viewBox="0 0 64 64"
	aria-hidden="true"
	class={className}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<defs>
		<linearGradient id="headmaster-mark-stroke" x1="8" y1="14" x2="58" y2="52" gradientUnits="userSpaceOnUse">
			<stop stop-color="#1498FF" />
			<stop offset="0.42" stop-color="#7C3AED" />
			<stop offset="0.76" stop-color="#FF2D8F" />
			<stop offset="1" stop-color="#FFB020" />
		</linearGradient>
		<radialGradient
			id="headmaster-mark-glow"
			cx="0"
			cy="0"
			r="1"
			gradientUnits="userSpaceOnUse"
			gradientTransform="translate(32 32) rotate(90) scale(30)"
		>
			<stop stop-color="#7C3AED" stop-opacity="0.45" />
			<stop offset="1" stop-color="#2563FF" stop-opacity="0" />
		</radialGradient>
	</defs>
	<rect x="2" y="2" width="60" height="60" rx="18" fill="#0D0F14" />
	<rect x="2" y="2" width="60" height="60" rx="18" fill="url(#headmaster-mark-glow)" />
	<path
		d="M18 20L32 12L46 20V44L32 52L18 44V20Z"
		stroke="url(#headmaster-mark-stroke)"
		stroke-width="3.4"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M32 12V52M18 32H27M37 32H46M18 20L27 26V38L18 44M46 20L37 26V38L46 44"
		stroke="url(#headmaster-mark-stroke)"
		stroke-width="3.4"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<circle cx="18" cy="20" r="4.2" fill="#1498FF" />
	<circle cx="18" cy="44" r="4.2" fill="#1498FF" />
	<circle cx="32" cy="12" r="4.2" fill="#4D5DFF" />
	<circle cx="32" cy="52" r="4.2" fill="#7C3AED" />
	<circle cx="46" cy="20" r="4.2" fill="#FF2D8F" />
	<circle cx="46" cy="44" r="4.2" fill="#FF7A3D" />
	<circle cx="32" cy="32" r="6.2" fill="#0D0F14" stroke="url(#headmaster-mark-stroke)" stroke-width="3" />
</svg>
