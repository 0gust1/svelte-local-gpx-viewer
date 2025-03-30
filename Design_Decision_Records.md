# Design Decision Intentions

NB #1: This document is a draft, a work in progress, and will be updated as the project evolves.

NB #2: the project's name will surely have to change, as it's not GPX-spedific anymore, and tries now to aim further.

## History

The project started as a very simple and crude side-project to display a set of GPX files on a map, and to be able to compare them. It was a first step to test the waters and to try things to get a better understanding and refining of the needs and topic.

Now it's time to take a step back and to define a more structured approach to the project.

## Vision

A project that is:

(order of priority/importance)

- A webapp to:
  - manage collection(s) of hiking/biking/outdoor routes, display them and compare them.
  - edit (to a certain extent) the routes, and enrich thems: add notes, pictures, etc.
  - compute and visualize metrics (elevation, speed, heart rate, power output) on the routes or a timespan (i.e. training and sport/performance analysis)
- A clear and interoperable data format (shared by the "app" and the reusable display components).
- A library of reusable components to:
  - enable people to show/publish/share their routes on their own website, with a clear and simple data contract.
  - a library to help developers build their own apps to manage routes

### Motivation

There are a lot of apps/platforms to manage routes, but they are almost all tied to a specific platform (web, mobile, etc.), and they are all online services, often with a subscription-based business model, with often walled-garden dark patterns.

There is a recurring need (observed in the outdoor community and in my own filtered bubble) to be able to share routes, and to be able to compare them (and to be able to enrich them with pictures, notes, etc.) and publish them on a personal website.

For now, the only way to do that is to use third party services (embedded iframes from ridewithgps or Strava, etc.), making the user dependent on a third party service, its features (or lack of) and its business model.

### Goals / Decisions

- App is local and offline first (even if it not a PWA for now):
  - no server to deploy/maintain, less macro-complexity.
  - no dependency on a third party service
  - not tied to a specific platform

- A route or a collection of routes should be easily exportable, as an archive (zip file) containing:
  - the route data (in a standardized format)
  - the images (in a standardized format)
  - the metadata (in a standardized format)

- A route should be exportable and downloadable as a widely compatible format (GPX, GeoJSON, etc.) 

App and components made with Svelte. Published as a Svelte library, and as a webcomponent library..

- easily reusabble in an existing Svelte app
- also exposing built/compiled framework-agnostic webcomponents (to be used in any JS app, or even in a static HTML page).

## Data modelling and data structure

The app / components will be built around the concept of a "Route".

A whole route is composed of:

- **A path** (or a series of paths) that can be followed. - mandatory
- **A collection of geolocalized pictures** - optional 
- **A collection of metrics coming from senssors** (speed, heart rate, cadence, etc.) - optional
- **Content/notes** associated with the the elements above. - optional (TBD: granuality of the notes: per route, per path, per picture, etc., format of the notes: text, markdown, etc.)

The most standard and agnostic way to represent a route is to leverage the GeoJSON format.

**Pro:**

- standardized format
- easy to parse (it's just normalized JSON)
- easy to manipulate
- easy to visualize, and close to the cartographic rendering engines
- Extensible (throough the `properties` field)

**Cons:**

- There is no GeoJSON-compliant native data structure that can represeent "a route" as described above.
- Can be verbose (and heavy, if a lot of data is stored) – e.g. a several hundred kilometers long route with a lot of data/sensoir frames, and a lot of pictures, etc. can be heavy to store and transfer.

**Solution:**

Define a custom JSON data structure whose elements are valid GeoJSON elements, and leverage the `properties` field to store the additional data.

TODO: insert/link here the JSON schema for the route data structure.

## Implementation details / notes

### Images management

Images can be:

- links (to already uploaded and optimized images on a server – e.g. dedicaed image hosting service or a CDN)
- filepaths (to images stored locally, in the DB / or in the filesystem of the output archive)

## Rferences and links

**NB: brain dump.**

GeoJSON and fit files:

- https://github.com/garmin/fit-javascript-sdk
- https://macwright.com/2015/03/23/geojson-second-bite
- https://github.com/roberto-butti/fit-geojson-vuejs
- https://github.com/smitchell/garmin-fit-geojson
- https://github.com/dc99dc99/fit-geojson-converter
- https://github.com/anetz89/geojson-slicer
- https://github.com/surflog-tech/fit2geo

Fit-file-parser

- https://github.com/jimmykane/fit-parser
- https://github.com/kumphol/fit-parser

Fit file format references:

- https://logiqx.github.io/gps-wizard/formats/fit.html
- https://logiqx.github.io/gps-wizard/fit.html
- https://developer.garmin.com/fit/cookbook/developer-data/

heatmap and maplibre

- https://maplibre.org/maplibre-gl-js/docs/examples/heatmap-layer/

schema validation (typecript types, json schema, zod, etc.)

- https://github.com/fabien0102/ts-to-zod
- https://github.com/StefanTerdell/json-schema-to-zod
- https://github.com/ThomasAribart/json-schema-to-ts
- https://www.timsanteford.com/posts/openai-structured-outputs-and-zod-and-zod-to-json-schema/