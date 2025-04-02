import Dexie, { type EntityTable, type Dexie as Dexietype } from 'dexie';
import type { RouteEntity } from './routes.datatypes';
import { liveQuery } from 'dexie';

// input data date (id is given by the database)
interface RouteEntityIn extends Omit<RouteEntity, 'id'> {
	id?: number;
}

const db = new Dexie('RoutesDatabase') as Dexietype & {
	geoJSONRoutes: EntityTable<RouteEntity, 'id'>;
};

db.version(4).stores({
	geoJSONRoutes: '++id, name, data, distance, elevation, visible, bbox'
});

const liveJSONRoutes = liveQuery<RouteEntity[]>(
	async () => await db.geoJSONRoutes.toArray()
);

export { db, liveJSONRoutes };
export type { RouteEntityIn, RouteEntity };
