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
import Geolocation from 'ol/Geolocation';


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

let accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

let positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);

let locationLayer = new VectorLayer({
  source: new VectorSource({
    features: [
      accuracyFeature,
      positionFeature
    ],
  }),
});

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
  collapsed: false,
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
    earthquakeLayer,
    locationLayer
  ],
  overlays: [
    overlay
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
  controls: defaultControls().extend([
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
  map.getTargetElement().style.cursor = selected ? 'pointer' : '';
});

let geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

el('track').addEventListener('change', function () {
  geolocation.setTracking(this.checked);
});

geolocation.on('change', function () {
  el('position').innerText = geolocation.getPosition() + ' [m]';
  el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
  el('altitude').innerText = geolocation.getAltitude() + ' [m]';
  el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
  el('heading').innerText = geolocation.getHeading() + ' [rad]';
  el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});

geolocation.on('error', function (error) {
  let info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});


geolocation.on('change:position', function () {
  let coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  map.getView().setCenter(coordinates);
});
