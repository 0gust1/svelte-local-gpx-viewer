<script lang="ts">
	import RoutesUpload from '$lib/RoutesUpload.svelte';
	import { getUIRoutes } from '$lib/routesData.svelte';
	import { length } from '@turf/turf';
	import { gpx } from '@tmcw/togeojson';
	import { bbox } from '@turf/turf';
	import type { Feature } from 'geojson';

	let files = $state<FileList | null>(null);

	const uiRoutes = getUIRoutes();

	const SMOOTH_ELE_FACTOR = 4;
	const ELE_THRESHOLD = 0;

	function smoothElevations(
		coords: number[][],
		windowSize: number = SMOOTH_ELE_FACTOR
	): number[][] {
		const smoothed = [];
		for (let i = 0; i < coords.length; i++) {
			const window = coords.slice(
				Math.max(0, i - Math.floor(windowSize / 2)),
				i + Math.ceil(windowSize / 2)
			);
			const avgElevation = window.reduce((sum, coord) => sum + (coord[2] ?? 0), 0) / window.length;
			smoothed.push([coords[i][0], coords[i][1], avgElevation]);
		}
		return smoothed;
	}

	function calculateElevation(
		feature: Feature,
		threshold: number = ELE_THRESHOLD
	): { positive: number; negative: number } {
		if (feature.geometry.type === 'LineString') {
			let positive = 0;
			let negative = 0;
			let coords = feature.geometry.coordinates;

			// Smooth the elevation data
			coords = smoothElevations(coords);

			for (let i = 0; i < coords.length - 1; i++) {
				const currentElevation = coords[i][2] ?? 0;
				const nextElevation = coords[i + 1][2] ?? 0;

				const elevation = nextElevation - currentElevation;

				// Apply threshold to ignore small changes
				if (Math.abs(elevation) > threshold) {
					if (elevation > 0) {
						positive += elevation;
					} else {
						negative += elevation;
					}
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

	function getBoundingBox(geojson_feats: GeoJSON.Feature[]) {
		let boundingBox = bbox({
			type: 'FeatureCollection',
			features: geojson_feats
		});
		//if bounding box has 6 elements, it means it is a 3D bounding box, so we need to remove the last 2 elements
		if (boundingBox.length === 6) {
			return boundingBox.slice(0, 4) as [number, number, number, number];
		} else {
			return boundingBox as [number, number, number, number];
		}
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
					// validate the geojson	?
				}

				const routeLength = length(geojson.features[0], { units: 'kilometers' });

				const elevation = calculateElevation(geojson.features[0]);

				const boundingBox = getBoundingBox(geojson.features);

				// add the bounding box to the geojson
				geojson.bbox = boundingBox;

				console.log('geojson', geojson);

				// persist the geojson to the database
				await uiRoutes.createRoute({
					name: file.name.split('.').slice(0, -1).join('.'),
					data: geojson,
					distance: routeLength,
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

<RoutesUpload bind:files />
