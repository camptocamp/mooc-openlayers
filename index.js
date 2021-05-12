import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {OverviewMap, FullScreen, defaults as defaultControls} from 'ol/control';

var overviewMapControl = new OverviewMap({
  layers: [
    new TileLayer({
      source: new OSM(),
      url : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      attributionsCollapsible: true
    }) ],
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
      url : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      attributionsCollapsible: true
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
  controls: defaultControls().extend([
    overviewMapControl
  ])
})
