import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Circle, Fill, Stroke, Style, Text} from 'ol/style';
import {Attribution, ScaleLine, OverviewMap, ZoomToExtent, defaults as defaultControls} from 'ol/control';
import Overlay from 'ol/Overlay';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {get as getProjection} from 'ol/proj';
import Projection from 'ol/proj/Projection';

proj4.defs(
  'ESRI:53009',
  '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs'
);
register(proj4);

var myProjection = new Projection({
  code: 'ESRI:53009',
  extent: [
    -18019909.21177587,
    -9009954.605703328,
    18019909.21177587,
    9009954.605703328
  ],
  worldExtent: [-179, -89.99, 179, 89.99],
});

let popupContainer = document.getElementById('popup');
let popupContent = document.getElementById('popup-content');

let overlay = new Overlay({
  element: popupContainer,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

let basemapLayer = new TileLayer({
  source: new OSM({
    url : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
  })
})

let overviewLayer = new TileLayer({
  source: new OSM({
    url : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
  })
})

let wmsLayer = new TileLayer({
  source: new TileWMS({
    url: 'https://sedac.ciesin.columbia.edu/geoserver/wms',
    params: {'LAYERS': 'ndh:ndh-earthquake-frequency-distribution', 'TILED': true},
    transition: 0,
  }),
})

let earthquakeStyleLabel = new Style({
  image: new Circle({
    fill: new Fill({color: 'rgba(0,0,0,0.4)'}),
    stroke: new Stroke({color: 'rgba(0,0,0,0.4)', width: 0.1})
  }),
  text: new Text({
    font: '12px sans-serif',
    fill: new Fill({color: 'rgba(0,0,0,0.8)'}),
    stroke: new Stroke({color: 'rgba(255,255,255,0.8)', width: 3}),
  })
})

let earthquakeStyleNoLabel = new Style({
  image: new Circle({
    fill: new Fill({color: 'rgba(0,0,0,0.4)'}),
    stroke: new Stroke({color: 'rgba(0,0,0,0.4)', width: 0.1})
  })
})

let earthquakeStyleFunction = function(feature, resolution) {
  let r = feature.get('mag')
  r = Math.round(r * 10) / 10
  earthquakeStyleLabel.getText().setText(r.toString())
  earthquakeStyleLabel.getImage().setRadius(r * (r / 2))
  earthquakeStyleNoLabel.getImage().setRadius(r * (r / 2))
  if (r >= 4) {
    return earthquakeStyleLabel
  } else {
    return earthquakeStyleNoLabel
  }
}

let earthquakeLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  }),
  style: earthquakeStyleFunction
})

let overviewMapControl = new OverviewMap({
  className: 'ol-overviewmap ol-custom-overviewmap',
  layers: [
    overviewLayer
  ],
  collapsed: true,
});

let zoomToExtentControl = new ZoomToExtent({
  extent: [
    -15000000,
    -24000000,
     15000000,
     29000000
  ],
})

function scaleControl() {
  let control = new ScaleLine({
    units: 'metric',
    bar: false,
    steps: 4,
    text: true,
    minWidth: 140,
  });
  return control;
}

const map = new Map({
  target: 'map',
  layers: [
    basemapLayer,
    wmsLayer,
    earthquakeLayer
  ],
  overlays: [
    overlay
  ],
  view: new View({
    projection: myProjection,
    center: [0, 0],
    zoom: 0,
  }),
  controls: defaultControls({ attributionOptions: { collapsible: true }}).extend([
    overviewMapControl,
    zoomToExtentControl,
    scaleControl()
  ])
})

let selected = null;

map.on('pointermove', function(e) {
  let coordinate = e.coordinate;
  if (selected !== null) {
    selected.setStyle(undefined);
    selected = null;
  }
  map.forEachFeatureAtPixel(e.pixel, function(f) {
    selected = f;
    return true;
  });
  if (selected) {
    overlay.setPosition(coordinate);
    popupContent.innerHTML = '<table><tr><td>Magnitude:</td><td>' + selected.get('mag') + '</td></tr>' +
                             '<tr><td>Location:</td><td>' + selected.get('place') + '</td></tr>' +
                             '<tr><td>Depth:</td><td>' + selected.get('depth') + '</td></tr></table>'
  } else {
    overlay.setPosition(undefined);
  }
});
