import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { openDB, deleteDB, wrap, unwrap, DBSchema } from 'idb';

interface LocalGeoJSONRouteEntity {
  id?: number;
  name: string;
  data: FeatureCollection<Geometry, GeoJsonProperties>;
  length?: number;
  elevation?: { positive: number; negative: number };
  visible?: boolean;
  originalGPXData?: string;
  color?: string;
  insertedAt?: number;
}

interface MyDB extends DBSchema { 
  routes:{
    key: number;
    value: LocalGeoJSONRouteEntity;
  };  
}

async function demo(){
  const db = await openDB<MyDB>('my-db', 1, {
    upgrade(db) {
      const routesStore = db.createObjectStore('routes',{
        keyPath: 'id',
        autoIncrement: true,
      });
      routesStore.createIndex('by-name', 'name', {unique: true});
      routesStore.createIndex('by-insertedAt', 'insertedAt', {unique: true});
    },
  });

  await db.put('routes', {name: 'route1', data: {type: 'FeatureCollection', features: []}});
  const route = await db.get('routes', 1);
  console.log(route);
}