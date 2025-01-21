import Dexie, { type EntityTable, type Dexie as Dexietype } from 'dexie';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { liveQuery } from 'dexie';

interface LocalGeoJSONRouteEntity {
	id?: number;
	name: string;
	data: FeatureCollection<Geometry, GeoJsonProperties>;
	length?: number;
	elevation?: { positive: number; negative: number };
	visible?: boolean;
	boundingBox?: [number, number, number, number];
	originalGPXData?: string;
	color?: string;
}

const db = new Dexie('RoutesDatabase') as Dexietype & {
	geoJSONRoutes: EntityTable<LocalGeoJSONRouteEntity, 'id'>;
};

db.version(2).stores({
	geoJSONRoutes: '++id, name, data, length, elevation, visible'
});

const liveGeoJSONRoutes = liveQuery<LocalGeoJSONRouteEntity[]>(
	async () => await db.geoJSONRoutes.toArray()
);

export { db, liveGeoJSONRoutes };
export type { LocalGeoJSONRouteEntity };
