<script lang="ts">
	import Upload from '$lib/Upload.svelte';
	import { db } from '$lib/localDB';
	import { length } from '@turf/turf';
	import { gpx } from '@tmcw/togeojson';
	import type { Feature } from 'geojson';

	let files = $state<FileList | null>(null);

	function calculateElevation(feature: Feature) {
		if (feature.geometry.type === 'LineString') {
			let positive = 0;
			let negative = 0;
			const coords = feature.geometry.coordinates;
			for (let i = 0; i < coords.length - 1; i++) {
				const current = coords[i];
				const next = coords[i + 1];
				const elevation = next[2] - current[2];
				if (elevation > 0) {
					positive += elevation;
				} else {
					negative += elevation;
				}
			}
			return { positive, negative };
		} else {
			return { positive: 0, negative: 0 };
		}
	}

	function getRandomColor() {
		// Generate random values for red, green, and blue within a range to avoid too light colors
		const r = Math.floor(Math.random() * 156); // 0-155
		const g = Math.floor(Math.random() * 130); // 0-155
		const b = Math.floor(Math.random() * 156); // 0-155

		// Convert to hexadecimal and return the color string
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	async function addToGeoJSONRoutes(files: FileList) {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			let text = await file.text();

			try {
				// if file extension is GPX
				let geojson = null;
				const isGPX = file.name.split('.').pop() === 'gpx';

				if (isGPX) {
					const gpxData = new DOMParser().parseFromString(text, 'text/xml');
					geojson = gpx(gpxData);
				} else {
					geojson = JSON.parse(text);
				}
				// calculate the length of the route
				const routeLength = length(geojson.features[0], { units: 'kilometers' });
				const elevation = calculateElevation(geojson.features[0]);
				// persist the geojson to the database
				await db.geoJSONRoutes.add({
					name: file.name.split('.').slice(0, -1).join('.'),
					data: geojson,
					length: routeLength,
					elevation,
					visible: true,
					originalGPXData: isGPX ? text : null,
					// add a nice color to the route
					color: getRandomColor()
				});
			} catch (error) {
				console.error('error', error);
			}
		}
	}

	$effect(() => {
		if (files) {
			addToGeoJSONRoutes(files);
			files = null;
		}
	});
</script>

<Upload bind:files />
