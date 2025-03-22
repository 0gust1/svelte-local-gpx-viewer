import { describe, it, expect, vi } from 'vitest';
import { smoothElevations, calculateElevation, getRandomColor, getBoundingBox, prepareRoutesFromFiles } from './route_utils';
import type { Feature } from 'geojson';
import { DOMParser as NodeDOMParser } from 'xmldom';
import { gpx } from '@tmcw/togeojson'; // Import the gpx function

describe('smoothElevations', () => {
	it('smooths elevation data correctly', () => {
		const coords = [
			[0, 0, 10],
			[1, 1, 20],
			[2, 2, 30],
			[3, 3, 40],
			[4, 4, 50]
		];
		const result = smoothElevations(coords, 3);
		expect(result).toEqual([
			[0, 0, 15],
			[1, 1, 20],
			[2, 2, 30],
			[3, 3, 40],
			[4, 4, 45]
		]);
	});
});

describe('calculateElevation', () => {
	it('calculates positive and negative elevation changes', () => {
		const feature: Feature = {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: [
					[0, 0, 10],
					[1, 1, 20],
					[2, 2, 15],
					[3, 3, 25]
				]
			},
			properties: {}
		};
		const result = calculateElevation(feature);
		expect(result).toEqual({ positive: 5, negative: 0 });
	});

	it('returns zero for non-LineString geometries', () => {
		const feature: Feature = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [0, 0, 10]
			},
			properties: {}
		};
		const result = calculateElevation(feature);
		expect(result).toEqual({ positive: 0, negative: 0 });
	});
});

describe('getRandomColor', () => {
	it('generates a valid hex color', () => {
		const color = getRandomColor();
		expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
	});
});

describe('getBoundingBox', () => {
	it('calculates the bounding box of GeoJSON features', () => {
		const features = [
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [10, 20]
				},
				properties: {}
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [30, 40]
				},
				properties: {}
			}
		];
		const result = getBoundingBox(features);
		expect(result).toEqual([10, 20, 30, 40]);
	});
});

describe('prepareRoutesFromFiles', () => {
	it('processes GPX and GeoJSON files correctly', async () => {
		const mockGPXFile = new File(
			[
				`<?xml version="1.0"?>
				<gpx>
					<trk>
						<trkseg>
							<trkpt lat="10" lon="20"><ele>100</ele></trkpt>
							<trkpt lat="30" lon="40"><ele>200</ele></trkpt>
						</trkseg>
					</trk>
				</gpx>`
			],
			'route.gpx',
			{ type: 'application/gpx+xml' }
		);

		const mockGeoJSONFile = new File(
			[
				JSON.stringify({
					type: 'FeatureCollection',
					features: [
						{
							type: 'Feature',
							geometry: {
								type: 'LineString',
								coordinates: [
									[10, 20, 100],
									[30, 40, 200]
								]
							},
							properties: {}
						}
					]
				})
			],
			'route.geojson',
			{ type: 'application/json' }
		);

		const files = {
			0: mockGPXFile,
			1: mockGeoJSONFile,
			length: 2,
			item(index: number) {
				return this[index];
			}
		} as unknown as FileList;

		const result = await prepareRoutesFromFiles(files);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			name: 'route',
			distance: expect.any(Number),
			elevation: { positive: expect.any(Number), negative: expect.any(Number) },
			color: expect.stringMatching(/^#[0-9a-fA-F]{6}$/)
		});
		expect(result[1]).toMatchObject({
			name: 'route',
			distance: expect.any(Number),
			elevation: { positive: expect.any(Number), negative: expect.any(Number) },
			color: expect.stringMatching(/^#[0-9a-fA-F]{6}$/)
		});
	});
});