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
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
  controls: defaultControls({ attributionOptions: { collapsible: true }}).extend([
    overviewMapControl,
    zoomToExtentControl,
    scaleControl()
  ])
})

function drawEarthquarterLegend() {
  let canvas = document.getElementById("eqcanvas");
  let ctx = canvas.getContext("2d");
  ctx.globalAlpha = 0.5;
  ctx.arc(10, 10, 10, 0, Math.PI * 2, false);
  ctx.fillStyle = "#000000";
  ctx.fill()
  ctx.globalAlpha = 1.0;
  ctx.font = "11px Arial";
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.strokeText("4.2", 2, 14);
  ctx.fillStyle = '#000000';
  ctx.fillText("4.2", 2, 14);
  ctx.font = "14px Arial";
  ctx.fillText("Magnitude", 25, 15);
}
drawEarthquarterLegend()
