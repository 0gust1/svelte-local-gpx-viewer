import type {
	Feature,
	FeatureCollection,
	GeoJsonProperties,
	Point,
	LineString,
	BBox
} from 'geojson';

/** Internal data types:
 *  Data types that are used to represent the data in the application, as it is persisted in the database.
 */

/**
 * PhotoGeoPoint is an extension of GeoJSON Point Feature representing a photo location.
 */
export interface PhotoGeoPoint extends Feature<Point, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		type: 'Photo';
	} & { title?:string, textContent?:string, alternativeText?:string, filename: string; extension: string; binaryContent?: Blob, url?: string };
}

/**
 * NoteGeoPoint is an extension of GeoJSON Point Feature representing a note location.
 */
export interface NoteGeoPoint extends Feature<Point, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		type: 'Note';
		content: string;
	};
}

/**
 * TrackerDataGeoPoint is an extension of GeoJSON Point Feature representing a tracker geolocalized data frame
 */
export interface TrackerDataGeoPoint extends Feature<Point, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		type: 'Tracker Data';
	};
}

/**
 * TrackGeoPath is an extension of GeoJSON LineString Feature representing a track path.
 */
export interface TrackGeoPath extends Feature<LineString, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		type: 'Track Path';
	};
}

/**
 * TrackGeoPathFrom is a GeoJSON Point Feature representing a track path starting point.
 */
export interface TrackGeoPathFrom extends Feature<Point, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		name: 'from';
		type: 'from';
	};
}

/**
 * TrackGeoPathTo is a GeoJSON Point Feature representing a track path ending point.
 */
export interface TrackGeoPathTo extends Feature<Point, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		name: 'to';
		type: 'to';
	};
}

/**
 * SensorDatas is an extension of GeoJSON FeatureCollection representing a collection of tracker data points.
 */
export interface RouteSensorDatas extends FeatureCollection {
	features: TrackerDataGeoPoint[];
	properties: GeoJsonProperties & {
		type: 'Sensors Datas';
	};
}

/**
 * RoutePhotos is a GeoJSON FeatureCollection representing a collection of photo points.
 */
export interface RoutePhotos extends FeatureCollection {
	features: PhotoGeoPoint[];
	properties: GeoJsonProperties & {
		type: 'Route Photos';
	};
}

/**
 * RoutePaths is a FeatureCollection representing a collection of track paths.
 */
export interface RoutePaths extends FeatureCollection<LineString | Point, GeoJsonProperties> {
	features: Array<TrackGeoPath | TrackGeoPathFrom | TrackGeoPathTo>;
	properties: GeoJsonProperties & {
		type: 'Route Paths';
	};
}

/**
 * RouteNotes is a GeoJSON FeatureCollection representing a collection of note points.
 */
export interface RouteNotes extends FeatureCollection {
	features: NoteGeoPoint[];
	properties: GeoJsonProperties & {
		type: 'Route Notes';
	};
}

/**
 * RouteData is a dictionary of GeoJSON FeatureCollections representing the different data types associated with a route, expressed as a GeoJSON FeatureCollections.
 */
export interface RouteData {
	route: RoutePaths;
	notes: RouteNotes;
	photos: RoutePhotos;
	sensors: RouteSensorDatas;
}

/**
 * Route is a representation of a route, including its name, data, distance, and elevation.
 * It is used to represent the data in the application, minus the identifier and the visibility status.
 */
export interface Route {
	name: string;
	date?: Date;
	createdAt: Date;
	updatedAt: Date;
	textContent?: string;
	tags: string[];
	routeData: RouteData;
	distance: number;
	elevation: { positive: number; negative: number };
	originalGPXData?: string | null;
	originalFitData?: ArrayBuffer | null;
	originalParsedFitData?: object | null;
	color: string;
	bbox: BBox;
}

/**
 * RouteEntity is the direct representation of a route in the database, including its identifier and visibility status.
 */
export interface RouteEntity extends Route {
	id: number;
	visible: boolean;
}


/** IN data types:
 *  data coming from the outside world (e.g. from a file, from a server, etc.)
 */

// GeoJSON Route parsed from a GPX file or from a GeoJSON file
export interface ParsedRouteGeoJSON extends FeatureCollection<LineString, GeoJsonProperties> {
	features: Feature<LineString, GeoJsonProperties>[];
	properties: GeoJsonProperties;
}

