# Database, Data and data controllers

## Types and Schemas

The source of truth for types, data structures and schemas is the file `./route.datatypes.ts`.

From this file, the following files are generated:

- `./routes.generated.schema.json`: a JSON schema for the data structures, to be used as a reference for potential external tools.
- `./routes.generated.zod.ts`: a Zod schema for the data structures, to be used for validation inside the route metadata editor app.

## Database

`localDB.ts` is the typed wrapper, using Dexie.js, around the local IndexedDB database. It contains the database schema, migrations and the main DexieJS liveQuery.

It is not intended to be used directly, but rather through the data controllers.

## Data controllers

`routesData.svelte.ts` is the Svelte v5 reactive wrapper around the localDB. It contains the main data controller for the routes and the metadata editor app.

All operations on the database should be done through this file, to ensure that the data is always in sync with the UI.