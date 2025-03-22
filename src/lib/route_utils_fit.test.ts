import { describe, it, expect, vi} from 'vitest';
import { parseFitToGeoJSON } from './route_utils';
import type { Feature } from 'geojson';

import { Decoder, Stream } from '@garmin/fitsdk';


vi.mock('@garmin/fitsdk', () => {
	return {
		Stream: {
			fromByteArray: vi.fn()
		},
		Decoder: vi.fn().mockImplementation(() => ({
			isFIT: vi.fn(),
			checkIntegrity: vi.fn(),
			read: vi.fn()
		}))
	};
});

describe('parseFitToGeoJSON', () => {
    it('parses valid FIT data into GeoJSON', () => {
        // Mock FIT data
        const mockFITData = new ArrayBuffer(10);
        const mockMessages = {
            recordMesgs: [
                {
                    positionLat: 214748364, // Example latitude in semicircles
                    positionLong: 429496729, // Example longitude in semicircles
                    enhancedAltitude: 100 // Example altitude
                }
            ]
        };

        // Mock Stream and Decoder behavior
        Stream.fromByteArray.mockReturnValue({});
        const mockDecoder = new Decoder({});
        mockDecoder.isFIT.mockReturnValue(true);
        mockDecoder.checkIntegrity.mockReturnValue(true);
        mockDecoder.read.mockReturnValue({ messages: mockMessages, errors: [] });

        // Call the function
        const result = parseFitToGeoJSON(mockFITData);

        // Assert the result
        expect(result).toEqual({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [0.02, 0.01, 100] // Converted lat/long and altitude
                        ]
                    },
                    properties: {}
                }
            ]
        });
    });

    it('throws an error for invalid FIT data', () => {
        // Mock invalid FIT data
        const mockFITData = new ArrayBuffer(10);

        // Mock Stream and Decoder behavior
        Stream.fromByteArray.mockReturnValue({});
        const mockDecoder = new Decoder({});
        mockDecoder.isFIT.mockReturnValue(false);

        // Assert that the function throws an error
        expect(() => parseFitToGeoJSON(mockFITData)).toThrowError('Invalid or corrupted FIT file');
    });

    it('logs errors if FIT file has decoding issues', () => {
        // Mock FIT data with errors
        const mockFITData = new ArrayBuffer(10);
        const mockMessages = {
            recordMesgs: []
        };
        const mockErrors = ['Error decoding FIT file'];

        // Mock Stream and Decoder behavior
        Stream.fromByteArray.mockReturnValue({});
        const mockDecoder = new Decoder({});
        mockDecoder.isFIT.mockReturnValue(true);
        mockDecoder.checkIntegrity.mockReturnValue(true);
        mockDecoder.read.mockReturnValue({ messages: mockMessages, errors: mockErrors });

        // Spy on console.error
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Call the function
        parseFitToGeoJSON(mockFITData);

        // Assert that errors were logged
        expect(consoleErrorSpy).toHaveBeenCalledWith('FIT errors:', mockErrors);

        // Restore console.error
        consoleErrorSpy.mockRestore();
    });
});