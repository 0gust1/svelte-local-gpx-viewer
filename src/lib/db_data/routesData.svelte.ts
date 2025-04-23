import { db, liveJSONRoutes, type RouteEntityIn, type RouteEntity } from './localDB';
import { get, type Readable } from 'svelte/store';
import { SvelteSet } from 'svelte/reactivity';
import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
import JSZipConstructor from 'jszip';
import type JSZip from 'jszip';
import { RouteEntitySchema } from './routes.generated.zod';
import { fileSave } from 'browser-fs-access';
import { simplify } from '@turf/turf';
//const ajv = new Ajv({allErrors: true});
// const ajv = new Ajv();
// addFormats(ajv);
// const validateRouteEntity = ajv.compile({
// 	...schema, // Include the full schema to resolve references
// 	$ref: '#/definitions/RouteEntity'
// });

let uiRoutes: RouteEntity[] = $state.raw(get(liveJSONRoutes as unknown as Readable<RouteEntity[]>));
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
			await db.geoRoutes.update(id, { color: color });
		},
		async deleteRoute(id: number) {
			selectedRoutesIds.delete(id);
			await db.geoRoutes.delete(id);
		},
		async updateRouteVisibility(id: number, visibility: boolean) {
			await db.geoRoutes.update(id, { visible: visibility });
		},
		async updateRoute(obj: RouteEntity) {
			//console.log('updateRoute', obj);
			// TODO: validation
			obj.updatedAt = new Date().toUTCString();

			try {
				// Validate using Zod
				RouteEntitySchema.parse(obj);
			} catch (error) {
				console.error(error.errors);
				throw new Error('Invalid route entity');
			}

			return await db.geoRoutes.put(obj);
		},
		async getRoute(id: number) {
			return (await db.geoRoutes.get(id)) as RouteEntity | undefined;
		},
		async createRoute(obj: RouteEntityIn) {
			await db.geoRoutes.add(obj);
		},
		async exportRoute(id: number) {
			const route = await db.geoRoutes.get(id);
			if (!route) {
				throw new Error(`Route with id ${id} not found`);
			}
			const zip = new JSZipConstructor();

			generateRouteExport(route, zip);

			const blobP = zip.generateAsync({ type: 'blob' });

			const now = new Date();
			const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
				now.getDate()
			).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(
				now.getMinutes()
			).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

			await fileSave(blobP, {
				fileName: `${route.name}_${timestamp}.zip`,
				extensions: ['.zip'],
				description: 'Route archive'
			});
		},
		async downloadRoutesArchive(routesIds: number[]) {
			const zip = new JSZipConstructor();
			const routes =
				routesIds.length === 0
					? uiRoutes
					: uiRoutes.filter((route) => routesIds.includes(route.id));

			for (const route of routes) {
				generateRouteExport(route, zip.folder(route.name));
			}
			const now = new Date();
			const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
				now.getDate()
			).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(
				now.getMinutes()
			).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

			const blobP = zip.generateAsync({ type: 'blob' });

			await fileSave(blobP, {
				fileName: `routes-archives_${timestamp}.zip`,
				extensions: ['.zip'],
				description: 'Route archive'
			});
		}
	};
};

function generateRouteExport(route: RouteEntity, zipfolder: JSZip) {
	// Add GPX file
	const simplifiedGpx = GeoJsonToGpx(
		simplify(route.routeData.route, { tolerance: 0.00001, highQuality: true })
	);
	const simplifiedGpxData = new XMLSerializer().serializeToString(simplifiedGpx);
	zipfolder.file(`${route.name}_simplified.gpx`, simplifiedGpxData);

	const rawGpx = GeoJsonToGpx(route.routeData.route);
	const rawGpxData = new XMLSerializer().serializeToString(rawGpx);
	zipfolder.file(`${route.name}_raw.gpx`, rawGpxData);

	if (route.originalGPXData) {
		zipfolder.file(`${route.name}_original.gpx`, route.originalGPXData);
	}

	if (route.originalFitData) {
		const fitData = new Blob([route.originalFitData], { type: 'application/octet-stream' });
		zipfolder.file(`${route.name}_original.fit`, fitData);
	}

	// Add GeoJSON file
	const geoJSONData = JSON.stringify(route.routeData.route, null, 2);
	zipfolder.file(`${route.name}.geojson`, geoJSONData);
	// Add full entity file
	const fullEntityData = JSON.stringify(route, null, 2);
	zipfolder.file(`${route.name}.json`, fullEntityData);

	// loop through the images and add them to the zip
	if (route.routeData.photos) {
		for (const photo of route.routeData.photos.features) {
			if (photo.properties.type === 'Photo') {
				const image = photo.properties.binaryContent;
				const imageName = photo.properties.filename;
				zipfolder.file(`images/${imageName}`, image);
			}
		}
	}
}
