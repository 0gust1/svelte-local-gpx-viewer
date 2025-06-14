import type { PageLoad } from './$types';
import { DEFAULT_EXPORT_OPTIONS } from '$lib/db_data/config.datatypes';
import { getCurrentAppConfig } from '$lib/db_data/localDB';

export const load: PageLoad = async () => {
	const config = await getCurrentAppConfig();
	
	return {
		defaultExportOptions: DEFAULT_EXPORT_OPTIONS,
		config
	};
};
