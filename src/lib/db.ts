// db.ts
import Dexie, { type EntityTable } from 'dexie';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';


interface GeoJSONRoute {
	id?: number;
	name: string;
	data: FeatureCollection<Geometry, GeoJsonProperties>;
	length?: number;
	elevation?: {positive: number, negative: number};
	visible?: boolean;
	originalGPXData: string;
}

const db = new Dexie("RoutesDatabase") as Dexie & {
	geoJSONRoutes: EntityTable<
		GeoJSONRoute,
		'id'
	>
}

db.version(2).stores({
	geoJSONRoutes: '++id, name, data, length, elevation, visible, originalGPXData',
})

export { db }
export type { GeoJSONRoute as GeoJSON }
