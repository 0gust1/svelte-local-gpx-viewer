import * as z from "zod";

// Specifies the type of GeoJSON object.

export const GeoJsonLineStringTypeSchema = z.enum([
    "LineString",
]);
export type GeoJsonLineStringType = z.infer<typeof GeoJsonLineStringTypeSchema>;


export const StickyTypeSchema = z.enum([
    "Track Path",
]);
export type StickyType = z.infer<typeof StickyTypeSchema>;

// Specifies the type of GeoJSON object.

export const PhotoGeoPointTypeSchema = z.enum([
    "Feature",
]);
export type PhotoGeoPointType = z.infer<typeof PhotoGeoPointTypeSchema>;

// Specifies the type of GeoJSON object.

export const GeoJsonPointTypeSchema = z.enum([
    "Point",
]);
export type GeoJsonPointType = z.infer<typeof GeoJsonPointTypeSchema>;


export const PurpleNameSchema = z.enum([
    "from",
]);
export type PurpleName = z.infer<typeof PurpleNameSchema>;


export const FluffyNameSchema = z.enum([
    "to",
]);
export type FluffyName = z.infer<typeof FluffyNameSchema>;


export const FluffyTypeSchema = z.enum([
    "Note",
]);
export type FluffyType = z.infer<typeof FluffyTypeSchema>;


export const MagentaTypeSchema = z.enum([
    "Route Notes",
]);
export type MagentaType = z.infer<typeof MagentaTypeSchema>;

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

export const HilariousTypeSchema = z.enum([
    "LineString",
    "Point",
]);
export type HilariousType = z.infer<typeof HilariousTypeSchema>;


export const TentacledNameSchema = z.enum([
    "from",
    "to",
]);
export type TentacledName = z.infer<typeof TentacledNameSchema>;


export const AmbitiousTypeSchema = z.enum([
    "from",
    "to",
    "Track Path",
]);
export type AmbitiousType = z.infer<typeof AmbitiousTypeSchema>;


export const CunningTypeSchema = z.enum([
    "Route Paths",
]);
export type CunningType = z.infer<typeof CunningTypeSchema>;


export const TentacledTypeSchema = z.enum([
    "Tracker Data",
]);
export type TentacledType = z.infer<typeof TentacledTypeSchema>;


export const IndigoTypeSchema = z.enum([
    "Sensors Datas",
]);
export type IndigoType = z.infer<typeof IndigoTypeSchema>;

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

export const GeoJsonPointSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "coordinates": z.array(z.number()),
    "type": GeoJsonPointTypeSchema,
});
export type GeoJsonPoint = z.infer<typeof GeoJsonPointSchema>;

export const TrackGeoPathFromPropertiesSchema = z.object({
    "name": PurpleNameSchema,
    "type": PurpleNameSchema,
});
export type TrackGeoPathFromProperties = z.infer<typeof TrackGeoPathFromPropertiesSchema>;

export const TrackGeoPathToPropertiesSchema = z.object({
    "name": FluffyNameSchema,
    "type": FluffyNameSchema,
});
export type TrackGeoPathToProperties = z.infer<typeof TrackGeoPathToPropertiesSchema>;

export const RouteElevationSchema = z.object({
    "negative": z.number(),
    "positive": z.number(),
});
export type RouteElevation = z.infer<typeof RouteElevationSchema>;

export const ArrayBufferSchema = z.object({
    "byteLength": z.number(),
});
export type ArrayBuffer = z.infer<typeof ArrayBufferSchema>;

export const NoteGeoPointPropertiesSchema = z.object({
    "content": z.string(),
    "type": FluffyTypeSchema,
});
export type NoteGeoPointProperties = z.infer<typeof NoteGeoPointPropertiesSchema>;

export const RouteNotesPropertiesSchema = z.object({
    "type": MagentaTypeSchema,
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

export const GeoJsonSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "coordinates": z.array(z.union([z.array(z.number()), z.number()])),
    "type": HilariousTypeSchema,
});
export type GeoJson = z.infer<typeof GeoJsonSchema>;

export const PurplePropertiesSchema = z.object({
    "type": AmbitiousTypeSchema,
    "name": TentacledNameSchema.optional(),
});
export type PurpleProperties = z.infer<typeof PurplePropertiesSchema>;

export const RoutePathsPropertiesSchema = z.object({
    "type": CunningTypeSchema,
});
export type RoutePathsProperties = z.infer<typeof RoutePathsPropertiesSchema>;

export const TrackerDataGeoPointPropertiesSchema = z.object({
    "type": TentacledTypeSchema,
});
export type TrackerDataGeoPointProperties = z.infer<typeof TrackerDataGeoPointPropertiesSchema>;

export const RouteSensorDatasPropertiesSchema = z.object({
    "type": IndigoTypeSchema,
});
export type RouteSensorDatasProperties = z.infer<typeof RouteSensorDatasPropertiesSchema>;

export const RouteEntityElevationSchema = z.object({
    "negative": z.number(),
    "positive": z.number(),
});
export type RouteEntityElevation = z.infer<typeof RouteEntityElevationSchema>;

export const GeoJsonFeatureGeoJsonLineStringGeoJsonGeoJsonPropertiesSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonLineStringSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": z.union([z.record(z.string(), z.any()), z.null()]),
    "type": PhotoGeoPointTypeSchema,
});
export type GeoJsonFeatureGeoJsonLineStringGeoJsonGeoJsonProperties = z.infer<typeof GeoJsonFeatureGeoJsonLineStringGeoJsonGeoJsonPropertiesSchema>;

export const TrackGeoPathSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonLineStringSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": TrackGeoPathPropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type TrackGeoPath = z.infer<typeof TrackGeoPathSchema>;

export const TrackGeoPathFromSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonPointSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": TrackGeoPathFromPropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type TrackGeoPathFrom = z.infer<typeof TrackGeoPathFromSchema>;

export const TrackGeoPathToSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonPointSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": TrackGeoPathToPropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type TrackGeoPathTo = z.infer<typeof TrackGeoPathToSchema>;

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
    "content": BlobSchema,
    "extension": z.string(),
    "filename": z.string(),
    "textContent": z.string().optional(),
    "title": z.string().optional(),
    "type": PurpleTypeSchema,
});
export type PhotoGeoPointProperties = z.infer<typeof PhotoGeoPointPropertiesSchema>;

export const FeatureSchema = z.object({
    "bbox": z.array(z.number()).optional(),
    "geometry": GeoJsonSchema,
    "id": z.union([z.number(), z.string()]).optional(),
    "properties": PurplePropertiesSchema,
    "type": PhotoGeoPointTypeSchema,
});
export type Feature = z.infer<typeof FeatureSchema>;

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
    "features": z.array(FeatureSchema),
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
