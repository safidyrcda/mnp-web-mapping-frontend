'use client';

import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';

import Map from 'ol/Map';
import View from 'ol/View';

import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';

import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';

import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';

import { Fill, Stroke, Style } from 'ol/style';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import { fetchData } from './api';
import FeaturePopup from './popup';

export default function OpenLayersMap() {
  const popupRef = useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  useEffect(() => {
    let map: Map;
    let overlay: Overlay;

    async function initializeMap() {
      map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            }),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });

      overlay = new Overlay({
        element: popupRef.current!,
        positioning: 'bottom-center',
        stopEvent: true,
        offset: [0, -12],
      });

      map.addOverlay(overlay);

      const geojson = await fetchData();

      const features = new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      const vectorSource = new VectorSource({ features });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: 'rgba(0, 123, 255, 0.3)',
          }),
          stroke: new Stroke({
            color: '#2563eb',
            width: 2,
          }),
        }),
      });

      map.addLayer(vectorLayer);

      const extent = vectorSource.getExtent();
      if (extent.every((c) => !isNaN(c))) {
        map.getView().fit(extent, {
          padding: [60, 60, 60, 60],
          duration: 800,
        });
      }

      const clickSelect = new Select({
        condition: click,
        layers: [vectorLayer],
        style: new Style({
          fill: new Fill({
            color: 'rgba(239, 68, 68, 0.35)',
          }),
          stroke: new Stroke({
            color: '#ef4444',
            width: 3,
          }),
        }),
      });

      map.addInteraction(clickSelect);

      clickSelect.on('select', (e) => {
        const feature = e.selected[0];

        if (!feature) {
          setSelectedFeature(null);
          overlay.setPosition(undefined);
          return;
        }

        setSelectedFeature(feature);

        const geometry = feature.getGeometry();
        if (!geometry) return;

        const extent = geometry.getExtent();
        const coordinate = [
          (extent[0] + extent[2]) / 2,
          (extent[1] + extent[3]) / 2,
        ];

        overlay.setPosition(coordinate);

        map.getView().fit(geometry.getExtent(), {
          padding: [80, 80, 80, 80],
          duration: 500,
          maxZoom: 18,
        });
      });

      map.on('pointermove', (evt) => {
        map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel)
          ? 'pointer'
          : '';
      });
    }

    initializeMap();

    return () => {
      if (map) map.setTarget(undefined);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div id="map" style={{ height: '100vh', width: '100%' }} />

      <div ref={popupRef}>
        {selectedFeature && (
          <FeaturePopup
            feature={selectedFeature}
            coordinate={selectedFeature.getGeometry()}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      </div>
    </div>
  );
}
