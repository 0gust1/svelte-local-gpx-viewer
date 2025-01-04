// db.ts
import Dexie, { type EntityTable, type Dexie as Dexietype } from 'dexie';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { liveQuery } from 'dexie';

import { openDB, deleteDB, wrap, unwrap } from 'idb';

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

const DB_NAME = 'RoutesDatabase';

const db = new Dexie(DB_NAME) as Dexietype & {
	geoJSONRoutes: EntityTable<LocalGeoJSONRouteEntity, 'id'>;
};

db.version(2).stores({
	geoJSONRoutes: '++id, name, data, length, elevation, visible'
});

const liveGeoJSONRoutes = liveQuery<LocalGeoJSONRouteEntity[]>(
	async () => await db.geoJSONRoutes.toArray()
);


const idb = await openDB(DB_NAME, 1.0, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    // …
  },
  blocked(currentVersion, blockedVersion, event) {
    // …
  },
  blocking(currentVersion, blockedVersion, event) {
    // …
  },
  terminated() {
    // …
  },
});

const idbStore = idb.createObjectStore('geoJSONRoutes', {});

export { db, liveGeoJSONRoutes, idb };
export type { LocalGeoJSONRouteEntity };