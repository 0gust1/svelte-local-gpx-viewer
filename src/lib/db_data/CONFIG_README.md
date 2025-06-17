# Configuration System

This document describes the configuration system implemented in the project.

## Overview

The configuration system allows users to customize app configuration, export options and image processing settings. This configuration is persisted in IndexedDB. When users export routes, the system will automatically use their saved configuration preferences.

## Components

### 1. Database Schema (`localDB.ts`)

The database includes a `appConfig` table to store configuration entities:

```typescript
interface ConfigEntity {
  id: number;
  config: AppConfiguration;
  createdAt: Date;
  updatedAt: Date;
}
```

Configuration history is maintained (new configurations are added rather than overwriting existing ones).

### 2. Data Types (`config.datatypes.ts`)

Defines the complete configuration structure including:

- **App configuration**: Main configuration object
- **Export Options**: URL prefixes/suffixes, route simplification settings
- **Image Processing Options**: Formats, quality, widths, and advanced codec settings
- **Format-Specific Options**: Detailed settings for JPEG, WebP, and AVIF encoding

### 3. Config Data Controller (`configData.svelte.ts`)

Provides reactive configuration management with:

- `getConfigManager()`: Returns reactive config manager
- Live updates from database via Dexie liveQuery
- Save/load operations

### 4. UI Components

#### Config Screen (`/config`)

- Complete form interface for all configuration options
- Real-time updates and validation
- Save/reset functionality
- Debug view of current configuration

#### Image Processing Config Component

- Comprehensive form for image processing settings
- Format-specific codec options (JPEG, WebP, AVIF)
- Responsive layout with organized sections

#### Export Options Config Component

- Static file URL configuration
- Route simplification settings
- Image processing toggle and options

## Usage

### For End Users

1. Navigate to `/config` in the application
2. Modify any settings as needed
3. Click "Save Configuration" to persist changes
4. Export operations will now use your saved settings automatically

### For Developers

#### Getting Current Config

```typescript
import { getCurrentAppConfig } from '$lib/db_data/localDB';

const config = await getCurrentAppConfig();
```

#### Using Config Manager

```typescript
import { getConfigManager } from '$lib/db_data/configData.svelte';

const configManager = getConfigManager();

// Get reactive config
const currentConfig = configManager.config;

// Save new config
await configManager.saveConfig(newConfig);
```

#### Integrating with Export

The export system automatically uses the current config when no explicit config is provided:

```typescript
// Uses saved config automatically
await uiRoutes.exportSelectedRoutes([routeId]);

// Override with specific config
await uiRoutes.exportSelectedRoutes([routeId], customConfig);
```
