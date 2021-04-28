import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {OverviewMap, FullScreen, defaults as defaultControls} from 'ol/control';
import {DragRotateAndZoom, defaults as defaultInteractions} from 'ol/interaction';

var overviewMapControl = new OverviewMap({
  layers: [
    new TileLayer({
      source: new OSM(),
    }) ],
});

var attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
      attributions: attributions
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
    minZoom: 2,
    maxZoom: 17,
    rotation: 0,
  }),
  controls: defaultControls().extend([
    overviewMapControl,
    new FullScreen({
      source: 'fullscreen',
    })
  ])
})
