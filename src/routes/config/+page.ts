import type { PageLoad } from './$types';
import { DEFAULT_EXPORT_OPTIONS, type AppConfiguration } from '$lib/db_data/config.datatypes';
import { browser } from '$app/environment';
import { getCurrentAppConfig } from '$lib/db_data/localDB';

export const load: PageLoad = async () => {
	let config: AppConfiguration;
    // If running in the browser, fetch the current app config from indexedDB
	if (browser) {
		config = await getCurrentAppConfig();
	} else {
    // else, when pre-rendering on the server, use the default config
		config = { exportOptions: DEFAULT_EXPORT_OPTIONS };
	}
	return {
		defaultExportOptions: DEFAULT_EXPORT_OPTIONS,
		config
	};
};
