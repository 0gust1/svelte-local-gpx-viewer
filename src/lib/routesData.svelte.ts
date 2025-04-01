import { db, liveJSONRoutes, type RouteEntityIn, type RouteEntity } from '$lib/localDB';
import { get } from 'svelte/store';
import { SvelteSet } from 'svelte/reactivity';
import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
import JSZip from 'jszip';

let uiRoutes: RouteEntity[] = $state.raw(get(liveJSONRoutes));
const selectedRoutesIds = new SvelteSet<number>();
const selectedRoutesInfo: { distance: number; elevation: { positive: number; negative: number } } =
	$derived.by(() => {
		const selectedRoutes = Array.from(selectedRoutesIds).map(
			(id) => uiRoutes.filter((route) => route.id === id)[0]
		);
		return selectedRoutes.reduce(
			(acc, route) => {
				acc.distance += route.distance;
				acc.elevation.positive += route.elevation?.positive || 0;
				acc.elevation.negative += route.elevation?.negative || 0;
				return acc;
			},
			{ distance: 0, elevation: { positive: 0, negative: 0 } } as {
				distance: number;
				elevation: { positive: number; negative: number };
			}
		);
	});

// subscribe to the DexieJS liveQuery store
liveJSONRoutes.subscribe((routes) => {
	//console.log('liveGeoJSONRoutes', routes);

	// When the store updates, update the runed signal
	uiRoutes = routes;
});

export const getUIRoutesManager = () => {
	return {
		get routes() {
			return uiRoutes;
		},
		get selectedRoutesIds() {
			return selectedRoutesIds;
		},
		get selectedRoutesInfo() {
			return selectedRoutesInfo;
		},
		async updateRouteColor(id: number, color: string) {
			await db.geoJSONRoutes.update(id, { color: color });
		},
		async deleteRoute(id: number) {
			selectedRoutesIds.delete(id);
			await db.geoJSONRoutes.delete(id);
		},
		async updateRouteVisibility(id: number, visibility: boolean) {
			await db.geoJSONRoutes.update(id, { visible: visibility });
		},
		async getRoute(id: number) {
			return (await db.geoJSONRoutes.get(id)) as RouteEntity;
		},
		async createRoute(obj: RouteEntityIn) {
			await db.geoJSONRoutes.add(obj);
		},
		async downloadAllRoutesArchive() {
			const zip = new JSZip();
			const routes = uiRoutes;

			for (const route of routes) {
				// Add GPX file
				let gpxData = route.originalGPXData;
				if (!gpxData) {
					const gpx = GeoJsonToGpx(route.data);
					gpxData = new XMLSerializer().serializeToString(gpx);
				}
				zip.file(`${route.name}.gpx`, gpxData);

				// Add GeoJSON file
				const geoJSONData = JSON.stringify(route.data, null, 2);
				zip.file(`${route.name}.geojson`, geoJSONData);
			}

			// Generate the ZIP file
			const content = await zip.generateAsync({ type: 'blob' });
			const url = URL.createObjectURL(content);

			// Generate a timestamp for the filename
			const now = new Date();
			const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
				now.getDate()
			).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(
				now.getMinutes()
			).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

			// Trigger download
			const a = document.createElement('a');
			a.href = url;
			a.download = `routes-archive_${timestamp}.zip`;
			a.click();
			URL.revokeObjectURL(url);
		}
	};
};
