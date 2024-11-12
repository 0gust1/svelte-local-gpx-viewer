// db.ts
import Dexie, { type EntityTable,type Dexie as Dexietype } from 'dexie';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

interface LocalGeoJSONRouteEntity {
	id?: number;
	name: string;
	data: FeatureCollection<Geometry, GeoJsonProperties>;
	length?: number;
	elevation?: { positive: number; negative: number };
	visible?: boolean;
	originalGPXData?: string;
	color?: string;
}

const db = new Dexie('RoutesDatabase') as Dexietype & {
	geoJSONRoutes: EntityTable<LocalGeoJSONRouteEntity, 'id'>;
};

db.version(2).stores({
	geoJSONRoutes: '++id, name, data, length, elevation, visible'
});

export { db };
export type { LocalGeoJSONRouteEntity };
