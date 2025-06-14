 

export interface ExportedRoute {
  preferedMapStyle: string;
}

export interface RouteManifest {
  paths: {
    geojson: string;
    json: string;
    gpx: string;
    fit: string;
  };
}