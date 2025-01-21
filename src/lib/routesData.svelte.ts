import {db, liveGeoJSONRoutes, type LocalGeoJSONRouteEntity } from '$lib/localDB';
import { get } from 'svelte/store';
import { SvelteSet } from 'svelte/reactivity';

let uiRoutes: LocalGeoJSONRouteEntity[] = $state.raw(get(liveGeoJSONRoutes));
const selectedRoutesIds = new SvelteSet<number>();
const selectedRoutesInfo = $derived.by(() => {
    const selectedRoutes = Array.from(selectedRoutesIds).map((id) => uiRoutes.filter((route) => route.id === id)[0]); 
    return selectedRoutes.reduce((acc, route) => {
        acc.length += route.length;;
        acc.elevation.positive += route.elevation?.positive || 0;
        acc.elevation.negative += route.elevation?.negative || 0;
        return acc;
    }, {length:0, elevation:{positive:0, negative:0}} as { length: number; elevation: { positive: number; negative: number } });
});

// subscribe to the DexieJS liveQuery store
liveGeoJSONRoutes.subscribe((routes) => {
    //console.log('liveGeoJSONRoutes', routes);
    
    // When the store updates, update the runed signal
    uiRoutes = routes;
});

export const getUIRoutes = () => {

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
            return await db.geoJSONRoutes.get(id);
        },
        async createRoute(obj:LocalGeoJSONRouteEntity){
            await db.geoJSONRoutes.add(obj);
        }
	};
};
