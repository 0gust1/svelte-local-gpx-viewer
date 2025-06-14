import type { PageLoad } from './$types';
import { DEFAULT_EXPORT_OPTIONS } from '$lib/db_data/config.datatypes';

export const load: PageLoad = () => {
	return {
		defaultExportOptions: DEFAULT_EXPORT_OPTIONS,
		config: {}
	};
};
