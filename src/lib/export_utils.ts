import type JSZip from 'jszip';
import type { RouteEntity } from '$lib/db_data/routes.datatypes';

import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
import { simplify } from '@turf/turf';
import JSZipConstructor from 'jszip';
import { fileSave } from 'browser-fs-access';

export interface ExportOptions {
	filesUrlPrefix: string;
	filesUrlSuffix: string;
	imagesUrlPrefix: string;
	imagesUrlSuffix: string;
	simplifyConfig: {
		tolerance: number;
		highQuality: boolean;
	};
}

export function sanitizeFileName(fileName: string): string {
	// Normalize to NFC (precomposed form)
	fileName = fileName.normalize('NFC');

	// Replace invalid characters with an underscore
	return fileName
		.replace(/[\s]+/g, '_') // Replace spaces with underscores
		.replace(/[\\/:*?"<>|]/g, '_') // Replace invalid characters
		.replace(/^\.+/, '') // Remove leading dots
		.substring(0, 255); // Limit to 255 characters
}

function formatImageNameToURL(filename: string, options: ExportOptions) {
  if(options.imagesUrlPrefix === '' && options.imagesUrlSuffix === '') {
    return `images/${filename}`;
  }
	return `${options.filesUrlPrefix}${filename}${options.filesUrlSuffix}`;
}

export function generateRouteExport(
	route: RouteEntity,
	zipfolder: JSZip,
	options: ExportOptions
): void {
	// Add GPX file
	const simplifiedGpx = GeoJsonToGpx(
		simplify(route.routeData.route, {
			tolerance: options.simplifyConfig.tolerance,
			highQuality: options.simplifyConfig.highQuality
		})
	);
	const simplifiedGpxData = new XMLSerializer().serializeToString(simplifiedGpx);
	zipfolder.file(`${route.name}_simplified.gpx`, simplifiedGpxData);

	const rawGpx = GeoJsonToGpx(route.routeData.route);
	const rawGpxData = new XMLSerializer().serializeToString(rawGpx);
	zipfolder.file(`${route.name}_raw.gpx`, rawGpxData);

	if (route.originalGPXData) {
		zipfolder.file(
			`${route.name}_original.gpx`,
			route.originalGPXData
		);
	}

	if (route.originalFitData) {
		const fitData = new Blob([route.originalFitData], { type: 'application/octet-stream' });
		zipfolder.file(
			`${route.name}_original.fit`,
			fitData
		);
	}

	// Add GeoJSON file
	const geoJSONData = JSON.stringify(route.routeData.route, null, 2);
	zipfolder.file(`${route.name}.geojson`, geoJSONData);
	

	// loop through the images and add them to the zip
	if (route.routeData.photos) {
		for (const photo of route.routeData.photos.features) {
			if (photo.properties.type === 'Photo') {
				const image = photo.properties.binaryContent;
				const imageName = photo.properties.filename;
        // add the image to the zip
				zipfolder.file(`images/${imageName}`, image);
        // muutate the image name to be a URL
        photo.properties.url = formatImageNameToURL(imageName, options);
        // remove the binaryContent property
        delete photo.properties.binaryContent;
			}
		}
	}

  // Add full entity file
	const fullEntityData = JSON.stringify(route, null, 2);
	zipfolder.file(`${route.name}.json`, fullEntityData);
}

export async function routesExport(
	routes: RouteEntity[],
	zipName: string,
	zipDescription: string,
	options: ExportOptions
): Promise<void> {
	// Create a new JSZip instance
	const zip = new JSZipConstructor();

	if (routes.length > 1) {
		// Add each route to the zip
		for (const route of routes) {
			const folder = zip.folder(`${sanitizeFileName(route.name)}`);
			if (folder) {
				generateRouteExport(route, folder, options);
			}
		}
	} else {
		generateRouteExport(routes[0], zip, options);
	}

	const now = new Date();
	const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
		now.getDate()
	).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(
		now.getMinutes()
	).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

	const blobP = zip.generateAsync({ type: 'blob' });

	fileSave(blobP, {
		fileName: `${sanitizeFileName(zipName)}_${timestamp}.zip`,
		description: zipDescription,
		extensions: ['.zip']
	});
}
