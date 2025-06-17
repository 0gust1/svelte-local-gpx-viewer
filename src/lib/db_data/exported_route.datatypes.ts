 import type { RouteEntity } from "./routes.datatypes";
 import type { StyleSpecification } from 'maplibre-gl';

 export interface ExportedRoute extends Omit<RouteEntity, 'visible' | 'originalParsedFitData' | 'originalFitData' | 'originalGPXData'> {
   preferedMapStyle: string | StyleSpecification;
 }

export interface RouteManifest {
  paths: {
    geojson: string;
    json: string;
    gpx: string;
    fit: string;
  };
}