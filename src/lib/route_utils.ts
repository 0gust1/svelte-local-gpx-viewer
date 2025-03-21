import { bbox, length } from '@turf/turf';
import type { Feature } from 'geojson';
import { gpx } from '@tmcw/togeojson';

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

export async function prepareRoutesFromFiles(files: FileList) {
	const processedRoutes = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const text = await file.text();

		try {
			let geojson = null;
			const isGPX = file.name.split('.').pop() === 'gpx';

			if (isGPX) {
				// Parse GPX file into GeoJSON
				const gpxData = new window.DOMParser().parseFromString(text, 'text/xml');
				geojson = gpx(gpxData);

				if (!geojson || !geojson.features) {
					console.error('Failed to parse GPX file:', file.name);
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
				data: geojson,
				distance: routeLength,
				elevation,
				visible: true,
				originalGPXData: isGPX ? text : null,
				color: getRandomColor()
			});
		} catch (error) {
			console.error('Error processing file:', file.name, error);
		}
	}
	return processedRoutes;
}
