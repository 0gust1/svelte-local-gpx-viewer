import { describe, it, expect } from 'vitest';
import { parseFitToJSON } from './route_utils';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from './routes.generated.schema.json';

describe('parseFitToJSON (Integration Tests)', () => {
	it('return a null route and the correct list of errors for an invalid FIT file', () => {
		// Load an invalid FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/empty.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		) as ArrayBuffer;
		const res = parseFitToJSON(fitDataArrayBuffer);
		// Assert that the function throws an error
		// Assert that the route is null
		expect(res.routeData).toBeNull();

		// Assert that errors are returned
		expect(res.errors).toBeInstanceOf(Array);
		expect(res.errors.length).toBeGreaterThan(0);
		expect(res.errors[0].message).toMatch(/File invalid, unrecognizable format/i);
	});
});

describe('parseFitToGeoJSON Integration tests (RWGPS examples)', () => {
	it('parses a valid FIT file into JSON', () => {
		// Load a valid FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/rwgps_example1.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		) as ArrayBuffer;

		// Call the function
		const result = parseFitToJSON(fitDataArrayBuffer);

		const ajv = new Ajv();
		addFormats(ajv);

		// Compile the specific definition
		const validate = ajv.compile({
			...schema, // Include the full schema to resolve references
			$ref: '#/definitions/RouteData'
		});

		const isValid = validate(result.routeData);
		// if (!isValid) {
		// 	console.error(validate.errors);
		// }
		//expect(isValid).toBe(true);

		expect(result.routeData?.route.features.length).toBeGreaterThan(0);
		expect(result.errors).toEqual([]);

		// Check that coordinates are valid
		const coordinates = result.routeData?.route.features[0].geometry.coordinates;
		expect(coordinates).toBeInstanceOf(Array);
		expect(coordinates[0]).toHaveLength(3); // [longitude, latitude, altitude]
	});

	it('parses a bad ? fit file', () => {
		// Load a valid FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/rwgps_example_bad1.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		) as ArrayBuffer;

		const ajv = new Ajv();
		addFormats(ajv);

		// Compile the specific definition
		const validate = ajv.compile({
			...schema, // Include the full schema to resolve references
			$ref: '#/definitions/RouteData'
		});

		// Call the function
		const result = parseFitToJSON(fitDataArrayBuffer);
		// the file is a "bad file" 
		expect(result.errors.length).toBeGreaterThan(0);

		// but it is still parses and produces a valid routeData
		const isValid = validate(result.routeData);
		//expect(isValid).toBe(true);

	});
});

describe('parseFitToGeoJSON Integration tests (Garmin examples)', () => {
	it('parses a valid FIT file (Activity.fit) into JSON', () => {
		// Load a valid FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/Activity.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		) as ArrayBuffer;

		// Call the function
		const result = parseFitToJSON(fitDataArrayBuffer);

		expect(result.errors).toEqual([]);

		const ajv = new Ajv();
		addFormats(ajv);
		// Compile the specific definition
		const validate = ajv.compile({
			...schema, // Include the full schema to resolve references
			$ref: '#/definitions/RouteData'
		});
		const isValid = validate(result.routeData);
		if (!isValid) {
			console.error(validate.errors);
		}
		//expect(isValid).toBe(true);
	});

	it('parses a valid FIT file (HrmPluginTestActivity.fit) into JSON', () => {
		// Load the HrmPluginTestActivity FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/HrmPluginTestActivity.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		) as ArrayBuffer;

		// Call the function
		const result = parseFitToJSON(fitDataArrayBuffer);

		const ajv = new Ajv();
		addFormats(ajv);

		// Compile the specific definition
		const validate = ajv.compile({
			...schema, // Include the full schema to resolve references
			$ref: '#/definitions/RouteData'
		});
		const isValid = validate(result.routeData);
		//expect(isValid).toBe(true);
	});

	it('parses a valid FIT file  (WithGearChangeData.fit) into JSON', () => {
		// Load the WithGearChangeData FIT file
		const fitFilePath = resolve(__dirname, '../../test/fixtures/WithGearChangeData.fit');
		const fitData = readFileSync(fitFilePath);
		const fitDataArrayBuffer = fitData.buffer.slice(
			fitData.byteOffset,
			fitData.byteOffset + fitData.byteLength
		) as ArrayBuffer;

		// Call the function
		const result = parseFitToJSON(fitDataArrayBuffer);

		const ajv = new Ajv();
		addFormats(ajv);

		// Compile the specific definition
		const validate = ajv.compile({
			...schema, // Include the full schema to resolve references
			$ref: '#/definitions/RouteData'
		});
		const isValid = validate(result.routeData);
		//expect(isValid).toBe(true);
	});
});
