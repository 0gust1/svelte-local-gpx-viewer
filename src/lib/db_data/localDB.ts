import Dexie, { type EntityTable, type Dexie as Dexietype } from 'dexie';
import type { RouteEntity } from './routes.datatypes';
import type { AppConfiguration } from './config.datatypes';
import { DEFAULT_EXPORT_OPTIONS } from './config.datatypes';
import { liveQuery } from 'dexie';

// input data (id is given by the database)
interface RouteEntityIn extends Omit<RouteEntity, 'id'> {
	id?: number;
}

interface ConfigEntity {
	id: number;
	config: AppConfiguration;
	createdAt: Date;
	updatedAt: Date;
}

interface ConfigEntityIn extends Omit<ConfigEntity, 'id'> {
	id?: number;
}

const db = new Dexie('RoutesDatabase') as Dexietype & {
	geoRoutes: EntityTable<RouteEntity, 'id'>;
	appConfig: EntityTable<ConfigEntity, 'id'>;
};

// version 5: add config table
db.version(5).stores({
	geoRoutes: '++id, name, distance, elevation, visible, bbox',
	appConfig: '++id, createdAt, updatedAt'
});

// Keep previous version for migration
db.version(4).stores({
	geoRoutes: '++id, name, distance, elevation, visible, bbox'
});

const liveJSONRoutes = liveQuery<RouteEntity[]>(
	async () => await db.geoRoutes.toArray()
);

const liveAppConfig = liveQuery<AppConfiguration>(
	async () => {
		const configs = await db.appConfig.orderBy('updatedAt').reverse().limit(1).toArray();
		if (configs.length === 0) {
			// Return default config if none exists
			return {
				exportOptions: DEFAULT_EXPORT_OPTIONS
			};
		}
		return configs[0].config;
	}
);

async function saveAppConfig(config: AppConfiguration): Promise<ConfigEntity> {
	const now = new Date();
	const configEntity: ConfigEntityIn = {
		config,
		createdAt: now,
		updatedAt: now
	};
	
	// Save new config (we keep history)
	const id = await db.appConfig.add(configEntity);
	return { ...configEntity, id } as ConfigEntity;
}

async function getCurrentAppConfig(): Promise<AppConfiguration> {
	const configs = await db.appConfig.orderBy('updatedAt').reverse().limit(1).toArray();
	if (configs.length === 0) {
		return {
			exportOptions: DEFAULT_EXPORT_OPTIONS
		};
	}
	return configs[0].config;
}

export { db, liveJSONRoutes, liveAppConfig, saveAppConfig, getCurrentAppConfig };
export type { RouteEntityIn, RouteEntity, ConfigEntity, ConfigEntityIn };
