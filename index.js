import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {OverviewMap, ZoomToExtent, defaults as defaultControls} from 'ol/control';

let basemapLayer = new TileLayer({
  source: new OSM({
    url : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attributionsCollapsible: true
  })
})

let overviewLayer = new TileLayer({
  source: new OSM({
    url : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
  })
})

let overviewMapControl = new OverviewMap({
  layers: [
    overviewLayer
  ],
});

let zoomToExtentControl = new ZoomToExtent({
  extent: [813079.8, 5929220.3, 848967.0, 5936864.0],
})

const map = new Map({
  target: 'map',
  layers: [
    basemapLayer
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
  controls: defaultControls().extend([
    overviewMapControl,
    zoomToExtentControl
  ])
})
