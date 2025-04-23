import type { StyleSpecification } from 'maplibre-gl';

export const defaultStyle: StyleSpecification =
	'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json' as unknown as StyleSpecification;

// vatious styles, gathered from:
// https://gitlab.huma-num.fr/bmericskay/maplibre/-/blob/master/Basemapsmenu.html
// https://maps.netsyms.net/
// https://basemaps.cartocdn.com/
// https://openfreemap.org/quick_start/
export const stylesList = [
	{
		name: 'OSM',
		style:
			'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json'
	},
	{
		name: 'cartocdn - positron',
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
	},

	// {name:"cycleosm", style:"https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/cycleosm.json"},
	{
		name: 'protomaps - light',
		style: 'https://api.protomaps.com/styles/v5/light/en.json?key=7b8825069d41df4e'
	},
	{
		name: 'protomaps - white',
		style: 'https://api.protomaps.com/styles/v5/white/en.json?key=7b8825069d41df4e'
	},
	{
		name: 'protomaps - greyscale',
		style: 'https://api.protomaps.com/styles/v5/grayscale/en.json?key=7b8825069d41df4e'
	},
	{ name: 'openfreemap - osm-liberty (3D)', style: 'https://tiles.openfreemap.org/styles/liberty' },
	{
		name: 'openfreemap - osm-bright',
		style: 'https://tiles.openfreemap.org/styles/bright'
	},
	{
		name: 'openfreemap - osm-positron',
		style: 'https://tiles.openfreemap.org/styles/positron'
	},
	{
		name: 'klokantech-freehills (netsym.net)',
		style: 'https://maps.netsyms.net/styles/klokantech-terrain-freehills/style.json'
	},
	{
		name: 'ArcGis hybrid (sat.)',
		style:
			'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json'
	},
	{
		name: 'IGN Std.',
		style: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json'
	},
	{
		name: 'IGN Att.',
		style: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/attenue.json'
	},
	{
		name: 'Fiord Color',
		style: 'https://openmaptiles.geo.data.gouv.fr/styles/fiord-color/style.json'
	},
	{
		name: 'osm-liberty-hills (netsym.net)',
		style: 'https://maps.netsyms.net/styles/osm-liberty-hillshading/style.json'
	},
	{
		name: 'klokantech 3d (netsym.net)',
		style: 'https://maps.netsyms.net/styles/klokantech-3d/style.json'
	},
	{
		name: 'toner (ICG Catalunya)',
		style: 'https://api.maptiler.com/maps/toner/style.json?key=rrASqj6frF6l2rrOFR4A'
	},
	{ name: 'toner (netsym.net)', style: 'https://maps.netsyms.net/styles/toner/style.json' },
	{ name: 'voyager', style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
	{
		name: 'darkmatter',
		style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
	},
	{
		name: 'hibrid (ICG Catalunya)',
		style: 'https://geoserveis.icgc.cat/contextmaps/hibrid.json'
	},
	{ name: 'cassini (netsym.net)', style: 'https://maps.netsyms.net/styles/cassini/style.json' },
	{ name: 'demotiles', style: 'https://demotiles.maplibre.org/style.json' },
	{ name: 'debug', style: 'https://demotiles.maplibre.org/debug-tiles/style.json' }
];
