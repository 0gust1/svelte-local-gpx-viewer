import * as z from "zod";

// Specifies the type of GeoJSON object.

export const GeoJsonPointTypeSchema = z.enum([
    "Point",
]);
export type GeoJsonPointType = z.infer<typeof GeoJsonPointTypeSchema>;


export const FluffyTypeSchema = z.enum([
    "Note",
]);
export type FluffyType = z.infer<typeof FluffyTypeSchema>;

// Specifies the type of GeoJSON object.

export const PhotoGeoPointTypeSchema = z.enum([
    "Feature",
]);
export type PhotoGeoPointType = z.infer<typeof PhotoGeoPointTypeSchema>;


export const AmbitiousTypeSchema = z.enum([
    "Route Notes",
]);
export type AmbitiousType = z.infer<typeof AmbitiousTypeSchema>;

// Specifies the type of GeoJSON object.

export const RouteSensorDatasTypeSchema = z.enum([
    "FeatureCollection",
]);
export type RouteSensorDatasType = z.infer<typeof RouteSensorDatasTypeSchema>;


export const PurpleTypeSchema = z.enum([
    "Photo",
]);
export type PurpleType = z.infer<typeof PurpleTypeSchema>;


export const IndecentTypeSchema = z.enum([
    "Route Photos",
]);
export type IndecentType = z.infer<typeof IndecentTypeSchema>;

// Specifies the type of GeoJSON object.

export const GeoJsonLineStringTypeSchema = z.enum([
    "LineString",
]);
export type GeoJsonLineStringType = z.infer<typeof GeoJsonLineStringTypeSchema>;


export const StickyTypeSchema = z.enum([
    "Track Path",
]);
export type StickyType = z.infer<typeof StickyTypeSchema>;


export const HilariousTypeSchema = z.enum([
    "Route Paths",
]);
export type HilariousType = z.infer<typeof HilariousTypeSchema>;


export const TentacledTypeSchema = z.enum([
    "Tracker Data",
]);
export type TentacledType = z.infer<typeof TentacledTypeSchema>;


export const IndigoTypeSchema = z.enum([
    "Sensors Datas",
]);
export type IndigoType = z.infer<typeof IndigoTypeSchema>;

export const RouteElevationSchema = z.object({
    "negative": z.number(),
    "positive": z.number(),
});
export type RouteElevation = z.infer<typeof RouteElevationSchema>;

export const ArrayBufferSchema = z.object({
    "byteLength": z.number(),
});
export type ArrayBuffer = z.infer<typeof ArrayBufferSchema>;

export const GeoJsonPointSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "coordinates": z.array(z.number()),
    "type": GeoJsonPointTypeSchema,
});
export type GeoJsonPoint = z.infer<typeof GeoJsonPointSchema>;

export const NoteGeoPointPropertiesSchema = z.object({
    "content": z.string(),
    "type": FluffyTypeSchema,
});
export type NoteGeoPointProperties = z.infer<typeof NoteGeoPointPropertiesSchema>;

export const RouteNotesPropertiesSchema = z.object({
    "type": AmbitiousTypeSchema,
});
export type RouteNotesProperties = z.infer<typeof RouteNotesPropertiesSchema>;

export const BlobSchema = z.object({
    "size": z.number(),
    "type": z.string(),
});
export type Blob = z.infer<typeof BlobSchema>;

export const RoutePhotosPropertiesSchema = z.object({
    "type": IndecentTypeSchema,
});
export type RoutePhotosProperties = z.infer<typeof RoutePhotosPropertiesSchema>;

export const GeoJsonLineStringSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "coordinates": z.array(z.array(z.number())),
    "type": GeoJsonLineStringTypeSchema,
});
export type GeoJsonLineString = z.infer<typeof GeoJsonLineStringSchema>;

export const TrackGeoPathPropertiesSchema = z.object({
    "type": StickyTypeSchema,
});
export type TrackGeoPathProperties = z.infer<typeof TrackGeoPathPropertiesSchema>;

export const RoutePathsPropertiesSchema = z.object({
    "type": HilariousTypeSchema,
});
export type RoutePathsProperties = z.infer<typeof RoutePathsPropertiesSchema>;

export const TrackerDataGeoPointPropertiesSchema = z.object({
    "accumulatedPower": z.number().optional(),
    "activityType": z.string().optional(),
    "altitude": z.number(),
    "cadence": z.number().optional(),
    "distance": z.number(),
    "enhancedAltitude": z.number().optional(),
    "enhancedRespirationRate": z.number().optional(),
    "enhancedSpeed": z.number().optional(),
    "fractionalCadence": z.number().optional(),
    "heartRate": z.number().optional(),
    "power": z.number().optional(),
    "speed": z.number().optional(),
    "temperature": z.number().optional(),
    "timestamp": z.coerce.date().optional(),
    "type": TentacledTypeSchema,
});
export type TrackerDataGeoPointProperties = z.infer<typeof TrackerDataGeoPointPropertiesSchema>;

export const RouteSensorDatasPropertiesSchema = z.object({
    "avgCadence": z.number().optional(),
    "avgHeartRate": z.number().optional(),
    "avgPower": z.number().optional(),
    "avgSpeed": z.number().optional(),
    "avgTemperature": z.number().optional(),
    "enhancedAvgRespirationRate": z.number().optional(),
    "enhancedAvgSpeed": z.number().optional(),
    "enhancedMaxRespirationRate": z.number().optional(),
    "enhancedMaxSpeed": z.number().optional(),
    "enhancedMinRespirationRate": z.number().optional(),
    "maxCadence": z.number().optional(),
    "maxHeartRate": z.number().optional(),
    "maxPower": z.number().optional(),
    "maxSpeed": z.number().optional(),
    "minHeartRate": z.number().optional(),
    "normalizedPower": z.number().optional(),
    "sport": z.string().optional(),
    "startTime": z.coerce.date().optional(),
    "subSport": z.string().optional(),
    "timestamp": z.coerce.date().optional(),
    "totalAscent": z.number().optional(),
    "totalCalories": z.number().optional(),
    "totalDescent": z.number().optional(),
    "totalDistance": z.number().optional(),
    "totalElapsedTime": z.number().optional(),
    "totalTimerTime": z.number().optional(),
    "totalWork": z.number().optional(),
    "type": IndigoTypeSchema,
});
export type RouteSensorDatasProperties = z.infer<typeof RouteSensorDatasPropertiesSchema>;

export const RouteEntityElevationSchema = z.object({
    "negative": z.number(),
    "positive": z.number(),
});
export type RouteEntityElevation = z.infer<typeof RouteEntityElevationSchema>;

export const FitActivitySummarySchema = z.object({
    "avgCadence": z.number().optional(),
    "avgHeartRate": z.number().optional(),
    "avgPower": z.number().optional(),
    "avgSpeed": z.number(),
    "avgTemperature": z.number().optional(),
    "enhancedAvgRespirationRate": z.number().optional(),
    "enhancedAvgSpeed": z.number(),
    "enhancedMaxRespirationRate": z.number().optional(),
    "enhancedMaxSpeed": z.number(),
    "enhancedMinRespirationRate": z.number().optional(),
    "maxCadence": z.number().optional(),
    "maxHeartRate": z.number().optional(),
    "maxPower": z.number().optional(),
    "maxSpeed": z.number(),
    "minHeartRate": z.number().optional(),
    "normalizedPower": z.number().optional(),
    "sport": z.string(),
    "startTime": z.coerce.date(),
    "subSport": z.string(),
    "timestamp": z.coerce.date(),
    "totalAscent": z.number(),
    "totalCalories": z.number(),
    "totalDescent": z.number(),
    "totalDistance": z.number(),
    "totalElapsedTime": z.number(),
    "totalTimerTime": z.number(),
    "totalWork": z.number(),
});
export type FitActivitySummary = z.infer<typeof FitActivitySummarySchema>;

export const SensorsDataFrameSchema = z.object({
    "accumulatedPower": z.number().optional(),
    "activityType": z.string().optional(),
    "altitude": z.number(),
    "cadence": z.number().optional(),
    "distance": z.number(),
    "enhancedAltitude": z.number().optional(),
    "enhancedRespirationRate": z.number().optional(),
    "enhancedSpeed": z.number().optional(),
    "fractionalCadence": z.number().optional(),
    "heartRate": z.number().optional(),
    "power": z.number().optional(),
    "speed": z.number().optional(),
    "temperature": z.number().optional(),
    "timestamp": z.coerce.date().optional(),
});
export type SensorsDataFrame = z.infer<typeof SensorsDataFrameSchema>;

export const FitDataFrameSchema = z.object({
    "accumulatedPower": z.number().optional(),
    "activityType": z.string().optional(),
    "altitude": z.number(),
    "cadence": z.number().optional(),
    "distance": z.number(),
    "enhancedAltitude": z.number().optional(),
    "enhancedRespirationRate": z.number().optional(),
    "enhancedSpeed": z.number().optional(),
    "fractionalCadence": z.number().optional(),
    "heartRate": z.number().optional(),
    "positionLat": z.number(),
    "positionLong": z.number(),
    "power": z.number().optional(),
    "speed": z.number().optional(),
    "temperature": z.number().optional(),
    "timestamp": z.coerce.date(),
});
export type FitDataFrame = z.infer<typeof FitDataFrameSchema>;

export const RouteInteractivePointSchema = z.object({
    "accumulatedPower": z.number().optional(),
    "activityType": z.string().optional(),
    "altitude": z.number(),
    "cadence": z.number().optional(),
    "coords": z.array(z.number()),
    "distance": z.number(),
    "enhancedAltitude": z.number().optional(),
    "enhancedRespirationRate": z.number().optional(),
    "enhancedSpeed": z.number().optional(),
    "fractionalCadence": z.number().optional(),
    "heartRate": z.number().optional(),
    "power": z.number().optional(),
    "speed": z.number().optional(),
    "temperature": z.number().optional(),
    "timestamp": z.coerce.date().optional(),
});
export type RouteInteractivePoint = z.infer<typeof RouteInteractivePointSchema>;

export const GeoJsonFeatureGeoJsonLineStringGeoJsonGeoJsonPropertiesSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonLineStringSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": z.union([z.record(z.string(), z.any()), z.null()]),
    "type": PhotoGeoPointTypeSchema,
});
export type GeoJsonFeatureGeoJsonLineStringGeoJsonGeoJsonProperties = z.infer<typeof GeoJsonFeatureGeoJsonLineStringGeoJsonGeoJsonPropertiesSchema>;

export const NoteGeoPointSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonPointSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": NoteGeoPointPropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type NoteGeoPoint = z.infer<typeof NoteGeoPointSchema>;

export const PhotoGeoPointPropertiesSchema = z.object({
    "alternativeText": z.string().optional(),
    "binaryContent": BlobSchema.optional(),
    "extension": z.string(),
    "filename": z.string(),
    "textContent": z.string().optional(),
    "title": z.string().optional(),
    "type": PurpleTypeSchema,
    "url": z.string().optional(),
});
export type PhotoGeoPointProperties = z.infer<typeof PhotoGeoPointPropertiesSchema>;

export const TrackGeoPathSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonLineStringSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": TrackGeoPathPropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type TrackGeoPath = z.infer<typeof TrackGeoPathSchema>;

export const TrackerDataGeoPointSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonPointSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": TrackerDataGeoPointPropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type TrackerDataGeoPoint = z.infer<typeof TrackerDataGeoPointSchema>;

export const ParsedRouteGeoJsonSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "features": z.array(GeoJsonFeatureGeoJsonLineStringGeoJsonGeoJsonPropertiesSchema),
    "properties": z.union([z.record(z.string(), z.any()), z.null()]),
    "type": RouteSensorDatasTypeSchema,
});
export type ParsedRouteGeoJson = z.infer<typeof ParsedRouteGeoJsonSchema>;

export const RouteNotesSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "features": z.array(NoteGeoPointSchema),
    "properties": RouteNotesPropertiesSchema,
    "type": RouteSensorDatasTypeSchema,
});
export type RouteNotes = z.infer<typeof RouteNotesSchema>;

export const PhotoGeoPointSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonPointSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": PhotoGeoPointPropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type PhotoGeoPoint = z.infer<typeof PhotoGeoPointSchema>;

export const RoutePathsSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "features": z.array(TrackGeoPathSchema),
    "properties": RoutePathsPropertiesSchema,
    "type": RouteSensorDatasTypeSchema,
});
export type RoutePaths = z.infer<typeof RoutePathsSchema>;

export const RouteSensorDatasSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "features": z.array(TrackerDataGeoPointSchema),
    "properties": RouteSensorDatasPropertiesSchema,
    "type": RouteSensorDatasTypeSchema,
});
export type RouteSensorDatas = z.infer<typeof RouteSensorDatasSchema>;

export const RoutePhotosSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "features": z.array(PhotoGeoPointSchema),
    "properties": RoutePhotosPropertiesSchema,
    "type": RouteSensorDatasTypeSchema,
});
export type RoutePhotos = z.infer<typeof RoutePhotosSchema>;

export const RouteDataSchema = z.object({
    "notes": RouteNotesSchema,
    "photos": RoutePhotosSchema,
    "route": RoutePathsSchema,
    "sensors": RouteSensorDatasSchema,
});
export type RouteData = z.infer<typeof RouteDataSchema>;

export const RouteEntitySchema = z.object({
    "bbox": z.array(z.number()),
    "color": z.string(),
    "createdAt": z.coerce.date(),
    "date": z.coerce.date().optional(),
    "distance": z.number(),
    "elevation": RouteEntityElevationSchema,
    "id": z.number(),
    "name": z.string(),
    "originalFitData": z.union([ArrayBufferSchema, z.null()]).optional(),
    "originalGPXData": z.union([z.null(), z.string()]).optional(),
    "originalParsedFitData": z.union([z.record(z.string(), z.any()), z.null()]).optional(),
    "routeData": RouteDataSchema,
    "tags": z.array(z.string()),
    "textContent": z.string().optional(),
    "updatedAt": z.coerce.date(),
    "visible": z.boolean(),
});
export type RouteEntity = z.infer<typeof RouteEntitySchema>;

export const RouteSchema = z.object({
    "bbox": z.array(z.number()),
    "color": z.string(),
    "createdAt": z.coerce.date(),
    "date": z.coerce.date().optional(),
    "distance": z.number(),
    "elevation": RouteElevationSchema,
    "name": z.string(),
    "originalFitData": z.union([ArrayBufferSchema, z.null()]).optional(),
    "originalGPXData": z.union([z.null(), z.string()]).optional(),
    "originalParsedFitData": z.union([z.record(z.string(), z.any()), z.null()]).optional(),
    "routeData": RouteDataSchema,
    "tags": z.array(z.string()),
    "textContent": z.string().optional(),
    "updatedAt": z.coerce.date(),
});
export type Route = z.infer<typeof RouteSchema>;
