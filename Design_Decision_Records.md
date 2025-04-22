# Design Decision Intentions / Records

NB #1: This document is a draft, a work in progress, and will be updated as the project evolves.

NB #2: the project's name will surely have to change, as it's not GPX-spedific anymore, and tries now to aim further.

## History

The project started as a very simple and crude side-project to display a set of GPX files on a map, and to be able to compare them. It was a first step to test the waters and to try things to get a better understanding and refining of the needs and topic.

Now it's time to take a step back and to define a more structured approach to the project.

## Vision

A project that is:

(order of priority/importance)

- A webapp to:
  1. manage collection(s) of hiking/biking/outdoor routes, display them and compare them.
  2. edit (to a certain extent) the routes, and enrich thems: add notes, pictures, etc.
  3. compute and visualize metrics (elevation, speed, heart rate, power output) on the routes or a timespan (i.e. training and sport/performance analysis)
- A clear and interoperable data format (shared by the "app" and the reusable display components).
- A library of reusable components to:
  1. enable people to show/publish/share their routes on their own website, with a clear and simple data contract.
  2. a library to help developers build their own apps to manage routes

This app and set of tools intent and primary goal is not to recode a clone of an existing solution, but to provide a set of easy and lightweight tools. Along the way, **it may be possible** (quite likely) that features from existing solutions will be implemented.

KISS for now, once the data format and the app are defined, it will be easier to add features.

### Motivation

There are a lot of apps/platforms to manage routes, but they are almost all tied to a specific platform (web, mobile, etc.), and they are almost all online services, often with a subscription-based business model, with often walled-garden dark patterns.

There is a recurring need (observed in the outdoor community and in my own filtered bubble) to be able to share routes, and to be able to compare them (and to be able to enrich them with pictures, notes, etc.) and publish them on a personal website.

For now, the only way to do that is to use third party services (embedded iframes from ridewithgps or Strava, etc.), making the user dependent on a third party service, its features (or lack of) and its business model.

### Goals / Decisions

- App is local and offline first (even if it not a PWA **for now**):
  - no server to deploy/maintain, less macro-complexity.
  - no dependency on a third party service
  - not tied to a specific platform

- A path or a collection of paths (see definition below, in "Data modelling and data structures") should be easily exportable, as an archive (zip file) containing:
  - the route data (in a standardized format)
  - the images (in a standardized format)
  - the metadata (in a standardized format)

- A route path should be exportable and downloadable as a widely compatible format (GPX, GeoJSON, etc.)

App and components made with Svelte. Published as a Svelte library, and as a webcomponent library..

- easily reusabble in an existing Svelte app
- also exposing built/compiled framework-agnostic webcomponents (to be used in any JS app, or even in a static HTML page).

### Example typical user workflows and use cases

There are two types of geographic paths: **routes** and **traces**.

- A **route** is a geographic path that has been *planned*. It has no associated data (time, sensor data, metrics, etc.). 
- A **trace** is a geographic path that has been *recorded* by a GPS device (or a phone). It has associated data (time, sensor data, metrics, etc.).

Record a route with a GPS device (or a phone)

Load/drag the route file in the app (fit file, GPX file, etc.)

Edit the route (cut, split, etc.)

Add pictures to the route (from a local folder, or from a URL)

Add notes to the route (text, markdown, etc.)

Export the route as a zip file (containing the route data, the images, and the metadata). The exported archive will contain a JSON file that will be useable to feed a display component, integrable in any website.

Contextual use case examples:

- A user wants to publish a ride journal on his own website.
- A collective wants to publish a carefully curated collection of routes on their website (with pictures, notes, instructions, etc.)
- A user wants to compare a set of routes (his own, or a set of routes from a community) and to be able to visualize them on a map, and to be able to compare them (elevation, speed, etc.)
- etc.

### Dicussions, inputs and inspirations

@n1k0@mamot.fr, @nhoizey@mamot.fr, myself and maybe @Saint_loup@mastodon.design seem to share the same needs around multi-routes display + sharing + publication + pictures association.

@david@larlet.fr, @banux@mamot.fr seem to be more on the data-analysis/planning/training side. (nice serie of exploratory posts by david: https://larlet.fr/david/2024/12/01/ )

@tsadiq@masto.bike wants to integrate with pixelfed/mastodon/ActivityPub

## Data modelling and data structures

The app / components will be built around the concept of a "Route".

A whole route is composed of:

- **A path** (or a series of paths) that can be followed. - mandatory
- **A collection of geolocalized pictures** - optional
- **A collection of metrics coming from senssors** (speed, heart rate, cadence, etc.) - optional
- **Content/notes** associated with the the elements above. - optional (TBD: granuality of the notes: per route, per path, per picture, etc., format of the notes: text, markdown, etc.)

The most standard and agnostic way to represent a route is to leverage the GeoJSON format (https://geojson.org/).

**NB:** A particular sub-format of GeoJSON, **TopoJSON** (https://github.com/topojson/topojson) could be worth investigating too.

**Pro:**

- standardized format
- easy to parse (it's "just" normalized JSON subset)
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

### Route edition and management

(Privacy) - Implement a mechanism to edit the geolocalized data of a route. Often the route starts at the home of the user, and the user doesn't want to share this information. The app should be able to edit the route data. Strava has a nice feature for that: a perimeter around the home is defined, and the route is "cut" at the perimeter. The app should be able to do something like that.

### Images management

This topic will need some digging.

Images can be:

- links (to already uploaded and optimized images on a server – e.g. dedicated image hosting service or a CDN)
- filepaths (to images stored locally, in the DB / or in the filesystem of the output archive)

Geolocation of the images can be done in two ways:

- by using the EXIF data of the image (if available)
- by using the geolocation data of the route and the timestamp of the image (if available) ?
- by manual placement on the map (if no geolocation data is available on images)

**Note**, image post-processing and optimization (compression, resizing, etc.) can be deep and is outside of the scope of this project.

**However**, the app should be able to handle images in a way that is agnostic to the image format and the image source, and doesn't impart eventual post-processings in users' workflow.

## References and links

**Disclaimer: brain dump.**

### GeoJSON

- https://geojson.org/
- https://github.com/topojson/topojson (topojson extension of geojson)
- https://geojson.xyz/ (example data)

### GeoJSON and fit files

- https://github.com/garmin/fit-javascript-sdk
- https://macwright.com/2015/03/23/geojson-second-bite
- https://github.com/roberto-butti/fit-geojson-vuejs
- https://github.com/smitchell/garmin-fit-geojson
- https://github.com/dc99dc99/fit-geojson-converter
- https://github.com/anetz89/geojson-slicer
- https://github.com/surflog-tech/fit2geo

### Fit-file-parser

- https://github.com/jimmykane/fit-parser
- https://github.com/kumphol/fit-parser

### Fit file format references

- https://logiqx.github.io/gps-wizard/formats/fit.html
- https://logiqx.github.io/gps-wizard/fit.html
- https://developer.garmin.com/fit/cookbook/developer-data/

### Maplibre

Maplibre is the cartographic rendering engine that is used to display the routes on the map.

- https://github.com/maplibre/awesome-maplibre
- https://github.com/jimmyrocks/maplibre-gl-vector-text-protocol 
- https://maplibre.org/maplibre-gl-js/docs/examples/heatmap-layer/ (heatmaps and maplibre)
- https://github.com/watergis/svelte-maplibre-components (ideas to steal ?)

### Schema validation (typecript types, json schemas, zod, etc.)

- https://github.com/vega/ts-json-schema-generator TS types to jsonschemas (the candidate approach for the project)
- https://ajv.js.org/ (json schema validator)
- https://github.com/fabien0102/ts-to-zod
- https://github.com/StefanTerdell/json-schema-to-zod
- https://github.com/ThomasAribart/json-schema-to-ts
- https://www.timsanteford.com/posts/openai-structured-outputs-and-zod-and-zod-to-json-schema/

### Elevation data and elevation calculation

**Content warning: Rabbit Hole ahead.**

Preliminary:

There is a difference between:

- elevation data coming from a route planner (in general, estimated with DEM public datasets)
- elevation data coming from a recorded route: depending on the device (presence of a barometer) and the origin of the file (directly from device or from "device + correction postprocessing through a platform like Strava")

Real world data (measurements from devices) is noisy and very diverse.

The difference between the sample rate of the device and the calibration/fiability of its measurements has an **enormous influence** on the computation of a cumulative metric like positive elevation / negative elevation.

#### General

https://gis.stackexchange.com/questions/67449/how-to-determine-the-most-accurate-elevation-algorithm#answer-259508

https://www.gpsvisualizer.com/tutorials/elevation_gain.php

#### Coros

https://support.coros.com/hc/en-us/articles/11432277964052-How-COROS-Devices-Measure-Elevation

#### Strava

https://support.strava.com/hc/en-us/articles/216919447-Elevation

https://support.strava.com/hc/en-us/articles/115000024864-Strava-s-Elevation-Basemap

https://support.strava.com/hc/en-us/articles/115001294564-Elevation-on-Strava-FAQs

#### RideWithGPS

https://support.ridewithgps.com/hc/en-us/articles/4419010957467-Grade-Elevation-and-GPS-Accuracy-FAQ

#### Komoot

https://support.komoot.com/hc/fr/articles/360023082951-Donn%C3%A9es-d-%C3%A9l%C3%A9vation-d-altitude
