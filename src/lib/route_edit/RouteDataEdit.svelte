<script lang="ts">
	import { bbox, booleanPointInPolygon, distance, point, polygon } from '@turf/turf';
	import type { RouteEntity } from '$lib';
	import Crayon from '$lib/route_edit/Crayon.svelte';
	import ObjectDisplay from '$lib/ObjectDisplay.svelte';
	import PhotosAdd from './PhotosAdd.svelte';

	let {
		route = $bindable(),
		photoSelection = $bindable(),
		isDirty = $bindable()
	}: { 
		route: RouteEntity; 
		photoSelection: { hovered: number | null; selected: number | null };
		isDirty?: boolean;
	} = $props();

	let routeDate = $state(formatDate(route.date));
	let createdAt = $state(formatDate(route.createdAt));
	let updatedAt = $state(formatDate(route.updatedAt));

	// Track original values to detect changes
	let originalRoute = $state($state.snapshot(route));
	let originalRouteDate = $state(routeDate);

	function formatDate(date: Date | string | undefined): string {
		if (!date) return '';
		return new Date(date).toISOString().slice(0, 10); // Convert to 'YYYY-MM-DD'
	}

	function formatTime(seconds: number): string {
		seconds = Math.floor(seconds); // Ensure seconds are whole numbers
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Helper function to create comparable photo data (excluding binary content)
	function getComparablePhotos(photos: typeof route.routeData.photos) {
		return photos.features.map(feature => ({
			type: feature.type,
			geometry: feature.geometry,
			properties: {
				type: feature.properties.type,
				title: feature.properties.title,
				filename: feature.properties.filename,
				extension: feature.properties.extension,
				textContent: feature.properties.textContent,
				alternativeText: feature.properties.alternativeText
				// Exclude binaryContent from comparison as it's not serializable
			}
		}));
	}

	// Update route.date when routeDate changes
	$effect(() => {
		if (routeDate && routeDate !== '') {
			route.date = new Date(routeDate);
		}
	});

	// Track dirty state with comprehensive photo comparison
	$effect(() => {
		const hasNameChanged = route.name !== originalRoute.name;
		const hasContentChanged = route.textContent !== originalRoute.textContent;
		const hasDateChanged = routeDate !== originalRouteDate;
		
		// Deep comparison of photos
		const currentPhotos = getComparablePhotos(route.routeData.photos);
		const originalPhotos = getComparablePhotos(originalRoute.routeData.photos);
		const hasPhotosChanged = JSON.stringify(currentPhotos) !== JSON.stringify(originalPhotos);
		
		isDirty = hasNameChanged || hasContentChanged || hasDateChanged || hasPhotosChanged;
	});

	// Reset dirty state when route is saved (called from parent)
	export function markAsSaved() {
		originalRoute = $state.snapshot(route);
		originalRouteDate = routeDate;
		isDirty = false;
	}

	// Helper function to check if photo coordinates are within route bounding box using Turf.js
	function isPhotoWithinRouteBounds(photoLng: number, photoLat: number, tolerance: number = 0.01): boolean {
		if (!route.bbox || route.bbox.length < 4) return false;

		const [minLng, minLat, maxLng, maxLat] = route.bbox;

		
		// Create a polygon from the bounding box with tolerance
		const bboxPolygon = polygon([[
			[minLng - tolerance, minLat - tolerance],
			[maxLng + tolerance, minLat - tolerance],
			[maxLng + tolerance, maxLat + tolerance],
			[minLng - tolerance, maxLat + tolerance],
			[minLng - tolerance, minLat - tolerance]
		]]);

		const photoPoint = point([photoLng, photoLat]);
		
		return booleanPointInPolygon(photoPoint, bboxPolygon);
	}

	// More precise distance-based check using Turf.js
	function isPhotoNearRoute(photoLng: number, photoLat: number, maxDistanceKm: number = 5): boolean {
		const coordinates = route.routeData.route.features[0]?.geometry.coordinates;
		if (!coordinates) return false;
		
		const photoPoint = point([photoLng, photoLat]);
		
		for (const [routeLng, routeLat] of coordinates) {
			const routePoint = point([routeLng, routeLat]);
			const dist = distance(photoPoint, routePoint, { units: 'kilometers' });
			if (dist <= maxDistanceKm) {
				return true;
			}
		}
		return false;
	}

	// Alternative: Use Turf.js to get bounding box from route geometry
	function getRouteBoundingBoxFromGeometry(): number[] | null {
		const routeFeature = route.routeData.route.features[0];
		if (!routeFeature) return null;
		
		return bbox(routeFeature);
	}

	// Export these functions so PhotosAdd can use them
	export { isPhotoWithinRouteBounds, isPhotoNearRoute };
</script>

<Crayon bind:dataToEdit={route.name} field={'name'}>
	<h2 class="mb-4 text-2xl font-bold">{route.name}</h2>
</Crayon>
<h3 class="text-sm font-medium text-slate-500">Content (Markdown ?)</h3>
<Crayon bind:dataToEdit={route.textContent} field={'description'}>
	<div class="mb-4 text-sm">{route.textContent}</div>
</Crayon>
<div class="text-xs">
	<p>Date: <input type="date" bind:value={routeDate} class="m-0 border-0 p-0 text-xs" /></p>

	<p>
		Created: <input readonly type="date" bind:value={createdAt} class="m-0 border-0 p-0 text-xs" />
	</p>

	<p>
		Last update: <input
			readonly
			type="date"
			bind:value={updatedAt}
			class="m-0 border-0 p-0 text-xs"
		/>
	</p>
</div>

{#if route.routeData.sensors.features.length > 0}
	<h3 class="inline-block text-lg font-medium">Stats</h3>
	<p>
		HR: {route.routeData.route.properties.avgHeartRate} (avg), {route.routeData.route.properties
			.minHeartRate} (min), {route.routeData.route.properties.maxHeartRate} (max)
	</p>
	<p>
		Speed: {((route.routeData.route.properties.avgSpeed * 60 * 60) / 1000).toFixed(2)} (avg), max: {(
			(route.routeData.route.properties.maxSpeed * 60 * 60) /
			1000
		).toFixed(2)}
	</p>
	<p>
		Total time: {formatTime(route.routeData.route.properties.totalElapsedTime)} ({formatTime(
			route.routeData.route.properties.totalTimerTime
		)} moving)
	</p>
	<details>
		<summary> Details: </summary>
		<ObjectDisplay data={route.routeData.route.properties} />
	</details>
{/if}

<details open={true}>
	<summary>
		<h3 class="inline-block text-lg font-medium">
			Photos ({route.routeData.photos.features.length})
		</h3>
	</summary>
	<PhotosAdd bind:photosToEdit={route.routeData.photos} bind:photoSelection {isPhotoNearRoute} {isPhotoWithinRouteBounds} />
</details>

<h3 class="text-lg font-medium">Notes ({route.routeData.notes.features.length})</h3>

<p>Add geotagged Notes ?</p>
