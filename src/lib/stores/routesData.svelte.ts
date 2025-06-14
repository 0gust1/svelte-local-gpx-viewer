import { db, liveJSONRoutes, getCurrentAppConfig, type RouteEntityIn, type RouteEntity } from '../db_data/localDB';
import { get, type Readable } from 'svelte/store';
import { SvelteSet } from 'svelte/reactivity';
import { RouteEntitySchema } from '../db_data/routes.generated.zod';
import { routesExport } from '$lib/export_utils';
import { type ExportOptions } from '$lib/db_data/config.datatypes';
import type { ExportProgress } from '$lib/workers/exportProcessor.worker';

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
			obj.updatedAt = new Date();

			try {
				// Validate using Zod
				RouteEntitySchema.parse(obj);
			} catch (error) {
				if (error instanceof Error) {
					console.error(error.message);
				}
				console.dir(obj);
				throw new Error('Invalid route entity', { cause: error });
			}

			return await db.geoRoutes.put(obj);
		},
		async getRoute(id: number) {
			return (await db.geoRoutes.get(id)) as RouteEntity | undefined;
		},
		async createRoute(obj: RouteEntityIn) {
			await db.geoRoutes.add(obj);
		},
		async exportSelectedRoutes(
			routesIds: number[],
			config?: ExportOptions,
			onProgress?: (progress: ExportProgress) => void
		) {
			const routes =
				routesIds.length === 0
					? uiRoutes
					: uiRoutes.filter((route) => routesIds.includes(route.id));

			if (routes.length === 0) {
				throw new Error('No routes selected', { cause: 'No routes to export' });
			}

			// If no config provided, get the current config from database
			const exportConfig = config || (await getCurrentAppConfig()).exportOptions;

			return await routesExport(
				routes,
				routes.length > 1 ? 'routes-archives' : routes[0].name,
				'Routes archive',
				exportConfig,
				onProgress
			);
		}
	};
};
