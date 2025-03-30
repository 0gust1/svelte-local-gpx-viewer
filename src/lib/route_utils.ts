import { bbox, length } from '@turf/turf';
import type { Feature, FeatureCollection, GeoJsonProperties, Point, LineString } from 'geojson';
import { gpx } from '@tmcw/togeojson';
import { Decoder, Stream } from '@garmin/fitsdk';

interface PhotoGeoPoint extends Feature<Point, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		type: 'Photo';
		filePath: string;
		url: string;
	};
}

interface TrackerDataGeoPoint extends Feature<Point, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		type: 'Tracker Data';
	}
}

interface TrackGeoPath extends Feature<LineString, GeoJsonProperties> {
	properties: GeoJsonProperties & {
		type: 'Track Path';
	};
}

interface SensorDataPoints extends FeatureCollection {
	features: TrackerDataGeoPoint[];
	properties: GeoJsonProperties;
}

interface RoutePhotos extends FeatureCollection {
	features: PhotoGeoPoint[];
	properties: GeoJsonProperties
}

interface RouteTracks extends FeatureCollection {
	features: TrackGeoPath[];
	properties: GeoJsonProperties & {
		type: 'Route Tracks';
};
}

interface RouteData  {
	name: string;
	data: {
		route: RouteTracks;
		photos: RoutePhotos;
		sensors: SensorDataPoints;
	};
	distance: number;
	elevation: { positive: number; negative: number };
};

interface RouteDataInApp extends RouteData {
	visible: boolean;
	originalGPXData?: string | null;
	originalParsedFitData?: object | null;
	color: string;
}

/**
 * Smooth the elevation data of coordinates.
 */
export function smoothElevations(coords: number[][], windowSize: number = 4): number[][] {
	const smoothed = [];
	for (let i = 0; i < coords.length; i++) {
		const smoothing_window = coords.slice(
			Math.max(0, i - Math.floor(windowSize / 2)),
			i + Math.ceil(windowSize / 2)
		);
		const avgElevation =
			smoothing_window.reduce((sum, coord) => sum + (coord[2] ?? 0), 0) / smoothing_window.length;
		smoothed.push([coords[i][0], coords[i][1], avgElevation]);
	}
	return smoothed;
}

/**
 * Calculate positive and negative elevation changes.
 */
export function calculateElevation(
	feature: Feature,
	threshold: number = 0
): { positive: number; negative: number } {
	if (feature.geometry.type === 'LineString') {
		let positive = 0;
		let negative = 0;
		let coords = feature.geometry.coordinates;

		// Smooth the elevation data
		coords = smoothElevations(coords);

		for (let i = 0; i < coords.length - 1; i++) {
			const currentElevation = coords[i][2] ?? 0;
			const nextElevation = coords[i + 1][2] ?? 0;

			const elevation = nextElevation - currentElevation;

			// Apply threshold to ignore small changes
			if (Math.abs(elevation) > threshold) {
				if (elevation > 0) {
					positive += elevation;
				} else {
					negative += elevation;
				}
			}
		}
		return { positive, negative };
	} else {
		return { positive: 0, negative: 0 };
	}
}

/**
 * Generate a random color.
 */
export function getRandomColor(): string {
	const r = Math.floor(Math.random() * 156);
	const g = Math.floor(Math.random() * 130);
	const b = Math.floor(Math.random() * 156);
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get the bounding box of GeoJSON features.
 */
export function getBoundingBox(geojson_feats: GeoJSON.Feature[]): [number, number, number, number] {
	const boundingBox = bbox({
		type: 'FeatureCollection',
		features: geojson_feats
	});
	// If bounding box has 6 elements, it means it is a 3D bounding box, so we need to remove the last 2 elements
	if (boundingBox.length === 6) {
		return boundingBox.slice(0, 4) as [number, number, number, number];
	} else {
		return boundingBox as [number, number, number, number];
	}
}

/**
 * Parse FIT file and convert it to GeoJSON.
 */
export function parseFitToGeoJSON(fitData: ArrayBuffer): {
	route: FeatureCollection;
	photos: FeatureCollection;
	sensors: FeatureCollection;
} {
	const stream = Stream.fromByteArray(new Uint8Array(fitData));
	if (!stream) {
		throw new Error('Failed to create stream from FIT data');
	}

	const decoder = new Decoder(stream);

	if (!decoder.isFIT() || !decoder.checkIntegrity()) {
		console.error('Invalid or corrupted FIT file');
	}

	const { messages, errors } = decoder.read();

	//console.log('FIT messages:', messages);
	if (errors.length) {
		console.error('FIT errors:', errors);
	}

	const coordinates = messages.recordMesgs
		.filter((message) => message.positionLat !== undefined && message.positionLong !== undefined)
		.map((message) => [
			message.positionLong / (2 ** 31 / 180) || 0, // Convert longitude to degrees
			message.positionLat / (2 ** 31 / 180) || 0, // Convert latitude to degrees
			message.enhancedAltitude || message.altitude || 0 // Use altitude if available
		]);

	return {
		route: {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates
					},
					properties: sessionMesgsToProperties(messages.sessionMesgs)
				},
				...extractFitData(messages.recordMesgs)
			]
		},
		sensors: {
			type: 'FeatureCollection',
			features: extractFitData(messages.recordMesgs)
		},
		photos: { type: 'FeatureCollection', features: [] }
	};
}

export async function prepareRoutesFromFiles(files: FileList) {
	const processedRoutes = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const text = await file.text();
		const arrayBuffer = await file.arrayBuffer();

		try {
			let geojson = null;
			const extension = file.name.split('.').pop()?.toLowerCase();

			if (extension === 'gpx') {
				// Parse GPX file into GeoJSON
				const gpxData = new window.DOMParser().parseFromString(text, 'text/xml');
				geojson = gpx(gpxData);

				if (!geojson || !geojson.features) {
					console.error('Failed to parse GPX file:', file.name);
					continue;
				}
			} else if (extension === 'fit') {
				// Parse FIT file into GeoJSON
				geojson = parseFitToGeoJSON(arrayBuffer);

				if (!geojson || !geojson.features) {
					console.error('Failed to parse FIT file:', file.name);
					continue;
				}
			} else {
				geojson = JSON.parse(text);

				if (!geojson || !geojson.features) {
					console.error('Failed to parse GeoJSON file:', file.name);
					continue;
				}
			}

			// Calculate the length of the route
			const routeLength = length(geojson.features[0], { units: 'kilometers' });
			const elevation = calculateElevation(geojson.features[0]);
			const boundingBox = getBoundingBox(geojson.features);
			geojson.bbox = boundingBox;

			processedRoutes.push({
				name: file.name.split('.').slice(0, -1).join('.'),
				data: { route: geojson, photos: {}, sensors: {} },
				distance: routeLength,
				elevation,
				visible: true,
				originalGPXData: extension === 'gpx' ? text : null,
				color: getRandomColor()
			});
		} catch (error) {
			console.error('Error processing file:', file.name, error);
		}
	}
	return processedRoutes;
}

function extractFitData(recordMesgs): Feature[] {
	return recordMesgs
		.filter((message) => message.positionLat !== undefined && message.positionLong !== undefined)
		.map((message) => ({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [
					message.positionLong / (2 ** 31 / 180) || 0, // Convert longitude to degrees
					message.positionLat / (2 ** 31 / 180) || 0 // Convert latitude to degrees
				]
			},
			properties: {
				type: 'Tracker Data',
				time: message.timestamp || null, // Timestamp of the record
				altitude: message.enhancedAltitude || message.altitude || 0, // Use enhanced altitude if available
				heartRate: message.heartRate || 0, // Heart rate
				cadence: message.cadence || 0, // Cadence
				speed: message.enhancedSpeed || message.speed || 0, // Speed in m/s
				temperature: message.temperature || null // Temperature
			}
		}));
}

function sessionMesgsToProperties(sessionMesgs): GeoJsonProperties {
	if (!sessionMesgs || sessionMesgs.length === 0) {
		return {};
	}

	// Extract relevant properties from the session messages
	const session = sessionMesgs[0]; // Assuming we only care about the first session message
	return {
		type: 'Tracker Data',
		sport: session.sport || 'unknown', // Sport type
		subSport: session.subSport || 'unknown', // Sub-sport type
		startTime: session.startTime || null, // Start time of the session
		timestamp: session.timestamp || null, // End time of the session
		totalElapsedTime: session.totalElapsedTime || 0, // Total elapsed time in seconds
		totalTimerTime: session.totalTimerTime || 0, // Total timer time in seconds
		totalDistance: session.totalDistance || 0, // Total distance in meters
		totalCalories: session.totalCalories || 0, // Total calories burned
		maxHeartRate: session.maxHeartRate || 0, // Maximum heart rate
		minHeartRate: session.minHeartRate || 0, // Minimum heart rate
		avgHeartRate: session.avgHeartRate || 0, // Average heart rate
		avgTemperature: session.avgTemperature || null, // Average temperature
		totalAscent: session.totalAscent || 0, // Total ascent in meters
		totalDescent: session.totalDescent || 0, // Total descent in meters
		maxCadence: session.maxCadence || 0, // Maximum cadence
		avgCadence: session.avgCadence || 0, // Average cadence
		maxSpeed: session.maxSpeed || 0, // Maximum speed in m/s
		avgSpeed: session.avgSpeed || 0, // Average speed in m/s
		maxPower: session.maxPower || 0, // Maximum power
		avgPower: session.avgPower || 0, // Average power
		totalWork: session.totalWork || 0, // Total work
		normalizedPower: session.normalizedPower || 0, // Normalized power
		enhancedMaxSpeed: session.enhancedMaxSpeed || 0, // Enhanced maximum speed
		enhancedAvgSpeed: session.enhancedAvgSpeed || 0 // Enhanced average speed
	};
}
