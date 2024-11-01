// db.ts
import Dexie, { type EntityTable } from 'dexie';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

interface GpxRoute {
	id?: number;
	name: string;
	data: string;
}

interface GeoJSONRoute {
	id?: number;
	name: string;
	data: FeatureCollection<Geometry, GeoJsonProperties>;
	length?: number;
	elevation?: {positive: number, negative: number};
}


const db = new Dexie("RoutesDatabase") as Dexie & {
	gpxRoutes: EntityTable<
		GpxRoute,
		'id'
	>,
	geoJSONRoutes: EntityTable<
		GeoJSONRoute,
		'id'
	>
}

db.version(1).stores({
	gpxRoutes: '++id, name, data',
	geoJSONRoutes: '++id, name, data, length, elevation'
})

export { db }
export type { GpxRoute, GeoJSONRoute as GeoJSON }
