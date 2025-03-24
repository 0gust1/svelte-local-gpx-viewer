import { describe, it, expect } from 'vitest';
import { parseFitToGeoJSON } from './route_utils';
import { readFileSync } from 'fs';
import { resolve } from 'path';


describe('parseFitToGeoJSON (Integration Tests)', () => {
	it('parses a valid FIT file (Activity.fit) into GeoJSON', () => {
		// Load a valid FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/Activity.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		);

		// Call the function
		const result = parseFitToGeoJSON(fitDataArrayBuffer);

		// Assert the result
		expect(result).toEqual({
			type: 'FeatureCollection',
			features: expect.any(Array)
		});
		expect(result.features.length).toBeGreaterThan(0);

		// Check that coordinates are valid
		const coordinates = result.features[0].geometry.coordinates;
		expect(coordinates).toBeInstanceOf(Array);
		expect(coordinates[0]).toHaveLength(3); // [longitude, latitude, altitude]
	});

	it('throws an error for an invalid FIT file', () => {
		// Load an invalid FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/empty.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		);

		// Assert that the function throws an error
		expect(() => parseFitToGeoJSON(fitDataArrayBuffer)).toThrowError(
			'Invalid or corrupted FIT file'
		);
	});

	it('parses a valid FIT file (HrmPluginTestActivity.fit) into GeoJSON', () => {
		// Load the HrmPluginTestActivity FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/HrmPluginTestActivity.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		);

		// Call the function
		const result = parseFitToGeoJSON(fitDataArrayBuffer);

		// Assert the result
		expect(result).toEqual({
			type: 'FeatureCollection',
			features: expect.any(Array)
		});
		expect(result.features.length).toBeGreaterThan(0);

		// Check that coordinates are valid
		const coordinates = result.features[0].geometry.coordinates;
		expect(coordinates).toBeInstanceOf(Array);
		expect(coordinates[0]).toHaveLength(3); // [longitude, latitude, altitude]
	});

	it('parses a valid FIT file  (WithGearChangeData.fit) into GeoJSON', () => {
		// Load the WithGearChangeData FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/WithGearChangeData.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		);

		// Call the function
		const result = parseFitToGeoJSON(fitDataArrayBuffer);

		// Assert the result
		expect(result).toEqual({
			type: 'FeatureCollection',
			features: expect.any(Array)
		});
		expect(result.features.length).toBeGreaterThan(0);

		// Check that coordinates are valid
		const coordinates = result.features[0].geometry.coordinates;
		expect(coordinates).toBeInstanceOf(Array);
		expect(coordinates[0]).toHaveLength(3); // [longitude, latitude, altitude]
	});
});
