import { liveAppConfig, saveAppConfig, getCurrentAppConfig } from '$lib/db_data/localDB';
import type { AppConfiguration } from '$lib/db_data/config.datatypes';
import { DEFAULT_EXPORT_OPTIONS } from '$lib/db_data/config.datatypes';

let currentConfig: AppConfiguration = $state.raw({ exportOptions: DEFAULT_EXPORT_OPTIONS });

// subscribe to the DexieJS liveQuery store
liveAppConfig.subscribe((config) => {
	// When the store updates, update the rune signal
	currentConfig = config;
});

export const getConfigManager = () => {
	return {
		get config() {
			return currentConfig;
		},
		async saveConfig(config: AppConfiguration) {
			await saveAppConfig(config);
		},
		async loadConfig() {
			const config = await getCurrentAppConfig();
			currentConfig = config;
			return config;
		}
	};
};
