import { liveGeoJSONRoutes, type LocalGeoJSONRouteEntity } from '$lib/localDB';
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

export const getUIRoutes = () => {
	liveGeoJSONRoutes.subscribe((routes) => {
		//console.log('liveGeoJSONRoutes', routes);
		uiRoutes = routes;
	});

	return {
		get routes() {
			return uiRoutes;
		},
		get selectedRoutesIds() {
			return selectedRoutesIds;
		},
        get selectedRoutesInfo() {
            return selectedRoutesInfo;
        }
		// set_selected:(index: number | null)=> {
		// 	if (index === null) {
		// 		selectedRoutesIds.clear();
		// 	} else {
		// 		selectedRoutesIds.add(index);
		// 	}
		// }
	};
};
