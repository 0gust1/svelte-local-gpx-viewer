import { bbox, length } from '@turf/turf';
import type { Feature, GeoJsonProperties, FeatureCollection, Geometry } from 'geojson';
import type { Route, RoutePaths, TrackerDataGeoPoint, RouteData } from './routes.datatypes';
import { gpx } from '@tmcw/togeojson';
import { Decoder, Stream } from '@garmin/fitsdk';

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
 * Parse FIT file and convert it to the data structure used in the application.
 */
export function parseFitToJSON(fitData: ArrayBuffer): {
	routeData: RouteData | null;
	errors: Error[],
	originalParsedFitData: object | null | undefined;
} {
	const stream = Stream.fromByteArray(new Uint8Array(fitData));
	if (!stream) {
		throw new Error('Failed to create stream from FIT data');
	}

	const decoder = new Decoder(stream);

	if (!decoder.isFIT()) {
		console.error('Unrecognizable FIT file');
		return { routeData: null, errors: [new Error('File invalid, unrecognizable format')], originalParsedFitData: null };
	}

	if (!decoder.checkIntegrity()) {
		console.warn('FIT file integrity is not valid');
	}

	const { messages, errors }: { messages: object; errors: Error[] } = decoder.read();

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
		routeData: {
			route: {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'LineString',
							coordinates
						},
						properties: { ...sessionMesgsToProperties(messages.sessionMesgs), type: 'Track Path' }
					}
				],
				properties: {
					...sessionMesgsToProperties(messages.sessionMesgs), type: 'Route Paths',
				}
			},
			sensors: {
				type: 'FeatureCollection',
				features: extractFitData(messages.recordMesgs),
				properties: { type: 'Sensors Datas', ...sessionMesgsToProperties(messages.sessionMesgs) }
			},
			photos: { type: 'FeatureCollection', features: [], properties: { type: 'Route Photos' } },
			notes: { type: 'FeatureCollection', features: [], properties: { type: 'Route Notes' } }
		},
		errors: errors,
		originalParsedFitData: messages
	};
}

/**
 * Parse a GPX file into the application's data structure.
 */
function parseGpxFile(filename: string, fileAsText: string): RouteData | Error {
	const gpxData = new window.DOMParser().parseFromString(fileAsText, 'text/xml');
	const featureCollection = gpx(gpxData);
	console.log('parsing gpx', featureCollection);
	if (
		!featureCollection ||
		!featureCollection.features ||
		!featureCollection.features.length ||
		!featureCollection.features[0] ||
		featureCollection.features[0].geometry.type !== 'LineString'
	) {
		console.error(`Failed to parse GPX file: ${filename}`);
		return new Error(`Failed to parse GPX file ${filename}`);
	}

	featureCollection.features[0].properties = { type: 'Track Path' };
	(
		featureCollection as FeatureCollection<Geometry, GeoJsonProperties> & {
			properties: GeoJsonProperties;
		}
	).properties = { type: 'Route Paths' };

	const routeData = {
		route: featureCollection as RoutePaths,
		photos: { type: 'FeatureCollection', features: [], properties: { type: 'Route Photos' } },
		sensors: { type: 'FeatureCollection', features: [], properties: { type: 'Sensors Datas' } },
		notes: { type: 'FeatureCollection', features: [], properties: { type: 'Route Notes' } }
	}
	console.log('routeData', routeData);
	return routeData;
	// return {
	// 	route: featureCollection as RoutePaths,
	// 	photos: { type: 'FeatureCollection', features: [], properties: { type: 'Route Photos' } },
	// 	sensors: { type: 'FeatureCollection', features: [], properties: { type: 'Sensors Datas' } },
	// 	notes: { type: 'FeatureCollection', features: [], properties: { type: 'Route Notes' } }
	// };
}

export async function prepareRoutesFromFiles(
	files: FileList
): Promise<Array<{ route: Route | null; errors: Error[] }>> {
	const processedRoutes: Array<{ route: Route | null; errors: Error[] }> = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const file_as_text = await file.text();
		const file_as_arrayBuffer = await file.arrayBuffer();
		const extension = file.name.split('.').pop()?.toLowerCase();

		let routeToInsert: Route | null = null;

		try {
			let routeData: RouteData | null = null;
			let errors: Error[] = [];
			let originalParsedFitData:object | null | undefined = null;

			if (extension === 'gpx') {
				// Use the new parseGpxFile function
				const routeDataOrError = parseGpxFile(file.name, file_as_text);
				if (!routeDataOrError || routeDataOrError instanceof Error) {
					console.error(`${file.name} - Failed to parse GPX file`);
					errors.push(new Error(`Failed to parse GPX file ${file.name}`));
				}else{
					routeData = routeDataOrError;
				}
			} else if (extension === 'fit') {
				// Parse FIT file into App data structure
				const parseResult = parseFitToJSON(file_as_arrayBuffer);

				// routeData is null: hard fail to parse the file
				if (!parseResult.routeData || parseResult.routeData === null) {
					console.error(`${file.name} - Failed to parse FIT file`);
					errors = parseResult.errors;
				}
				// routeData is not null: we have a valid routeData object, but there were errors
				// in the parsing process
				if (parseResult.errors.length) {
					console.error(`${file.name} parsed, but there were errors: ${parseResult.errors.map((e) => e.message)}`);
					errors = parseResult.errors;
				}
				routeData = parseResult.routeData;
				originalParsedFitData = parseResult.originalParsedFitData;
			}
			// user uploaded a json file coming from the app
			// else if (extension === 'json') {
			//     const parseResult = JSON.parse(file_as_text);
			//     // TODO: validate with AJV schema
			//     if (!parseResult || !parseResult.routeData) {
			//         console.error('Failed to parse JSON file:', file.name);
			//         continue;
			//     }
			//     routeData = parseResult;

			//     // Validate the data, it should be a Route object
			//     if (
			//         !routeData ||
			//         !routeData.routeData ||
			//         !routeData.routeData.route ||
			//         !routeData.routeData.photos ||
			//         !routeData.routeData.sensors
			//     ) {
			//         console.error('Failed to parse JSON file:', file.name);
			//         continue;
			//     }
			// }
			// user uploaded a geojson file
			else if (extension === 'geojson') {
				const geojson = JSON.parse(file_as_text);
				routeData = {
					route: geojson,
					photos: { type: 'FeatureCollection', features: [], properties: { type: 'Route Photos' } },
					sensors: {
						type: 'FeatureCollection',
						features: [],
						properties: { type: 'Sensors Datas' }
					},
					notes: { type: 'FeatureCollection', features: [], properties: { type: 'Route Notes' } }
				};
				if (!routeData || !routeData.route) {
					console.error('Failed to parse GEOJSON file:', file.name);
					errors.push(new Error(`Failed to parse GEOJSON file ${file.name}`));
				}
			} else {
				console.error('Unsupported file type:', file.name);
				errors.push(new Error(`Unsupported file type ${file.name}`));
			}

			if (!routeData) {
				processedRoutes.push({ route: null, errors });
			} else {
				// Calculate the length of the route
				// we assume the first feature is the route
				const routeLength = length(routeData.route.features[0], { units: 'kilometers' });
				const elevation = calculateElevation(routeData.route.features[0]);
				const boundingBox = getBoundingBox(routeData.route.features);

				routeToInsert = {
					name: file.name.split('.').slice(0, -1).join('.'),
					routeData: routeData,
					distance: routeLength,
					createdAt: new Date(),
					updatedAt: new Date(),
					description: '',
					tags: [],
					elevation,
					visible: true,
					originalGPXData: extension === 'gpx' ? file_as_text : null,
					originalParsedFitData: extension === 'fit' ? originalParsedFitData : null,
					originalFitData: extension === 'fit' ? file_as_arrayBuffer : null,
					color: getRandomColor(),
					bbox: boundingBox
				};

				processedRoutes.push({
					route: routeToInsert,
					errors: []
				});
			}
		} catch (error) {
			console.error('Error processing file:', file.name, error);
			processedRoutes.push({
				route: null,
				errors: [new Error(`Error processing file ${file.name}: ${error}`)]
			});
		}
	}
	return processedRoutes;
}

function extractFitData(recordMesgs): TrackerDataGeoPoint[] {
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

interface SessionMessage {
	sport?: string;
	subSport?: string;
	startTime?: string;
	timestamp?: string;
	totalElapsedTime?: number;
	totalTimerTime?: number;
	totalDistance?: number;
	totalCalories?: number;
	maxHeartRate?: number;
	minHeartRate?: number;
	avgHeartRate?: number;
	avgTemperature?: number;
	totalAscent?: number;
	totalDescent?: number;
	maxCadence?: number;
	avgCadence?: number;
	maxSpeed?: number;
	avgSpeed?: number;
	maxPower?: number;
	avgPower?: number;
	totalWork?: number;
	normalizedPower?: number;
	enhancedMaxSpeed?: number;
	enhancedAvgSpeed?: number;
}

function sessionMesgsToProperties(sessionMesgs: SessionMessage[]): GeoJsonProperties {
	if (!sessionMesgs || sessionMesgs.length === 0) {
		return {};
	}

	// Extract relevant properties from the session messages
	const session = sessionMesgs[0]; // Assuming we only care about the first session message
	return {
		type: 'Sensors Datas',
		sport: session?.sport ?? 'unknown', // Sport type
		subSport: 'subSport' in session ? session.subSport || 'unknown' : 'unknown', // Sub-sport type
		startTime: 'startTime' in session ? session.startTime || null : null, // Start time of the session
		timestamp: 'timestamp' in session ? session.timestamp || null : null, // End time of the session
		totalElapsedTime: 'totalElapsedTime' in session ? session.totalElapsedTime || 0 : 0, // Total elapsed time in seconds
		totalTimerTime: 'totalTimerTime' in session ? session.totalTimerTime || 0 : 0, // Total timer time in seconds
		totalDistance: 'totalDistance' in session ? session.totalDistance || 0 : 0, // Total distance in meters
		totalCalories: 'totalCalories' in session ? session.totalCalories || 0 : 0, // Total calories burned
		maxHeartRate: 'maxHeartRate' in session ? session.maxHeartRate || 0 : 0, // Maximum heart rate
		minHeartRate: 'minHeartRate' in session ? session.minHeartRate || 0 : 0, // Minimum heart rate
		avgHeartRate: 'avgHeartRate' in session ? session.avgHeartRate || 0 : 0, // Average heart rate
		avgTemperature: 'avgTemperature' in session ? session.avgTemperature || null : null, // Average temperature
		totalAscent: 'totalAscent' in session ? session.totalAscent || 0 : 0, // Total ascent in meters
		totalDescent: 'totalDescent' in session ? session.totalDescent || 0 : 0, // Total descent in meters
		maxCadence: 'maxCadence' in session ? session.maxCadence || 0 : 0, // Maximum cadence
		avgCadence: 'avgCadence' in session ? session.avgCadence || 0 : 0, // Average cadence
		maxSpeed: 'maxSpeed' in session ? session.maxSpeed || 0 : 0, // Maximum speed in m/s
		avgSpeed: 'avgSpeed' in session ? session.avgSpeed || 0 : 0, // Average speed in m/s
		maxPower: 'maxPower' in session ? session.maxPower || 0 : 0, // Maximum power
		avgPower: 'avgPower' in session ? session.avgPower || 0 : 0, // Average power
		totalWork: 'totalWork' in session ? session.totalWork || 0 : 0, // Total work
		normalizedPower: 'normalizedPower' in session ? session.normalizedPower || 0 : 0, // Normalized power
		enhancedMaxSpeed: 'enhancedMaxSpeed' in session ? session.enhancedMaxSpeed || 0 : 0, // Enhanced maximum speed
		enhancedAvgSpeed: 'enhancedAvgSpeed' in session ? session.enhancedAvgSpeed || 0 : 0 // Enhanced average speed
	};
}
