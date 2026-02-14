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
import { fetchData, fetchOne } from './api';
import FeaturePopup from './popup';
import { Extent } from 'ol/extent';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import { OSM } from 'ol/source';

export default function OpenLayersMap() {
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null); // add
  const overlayRef = useRef<Overlay | null>(null); // add
  const initialExtentRef = useRef<Extent | null>(null); // add

  useEffect(() => {
    let map: Map;
    let overlay: Overlay;

    async function initializeMap() {
      map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new TileArcGISRest({
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
            }),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });

      mapRef.current = map;

      overlay = new Overlay({
        element: popupRef.current!,
        positioning: 'bottom-center',
        stopEvent: true,
        offset: [0, -12],
      });
      overlayRef.current = overlay;

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
        initialExtentRef.current = extent;
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

      clickSelect.on('select', async (e) => {
        const feature = e.selected[0];

        if (!feature) {
          setSelectedFeature(null);
          overlay.setPosition(undefined);
          return;
        }

        const id = feature.get('id'); // ou ap_id selon ce que tu as mis

        try {
          // Récupérer les détails complets + géométrie complète depuis le backend
          const fullFeature = await fetchOne(id); // à implémenter dans api.ts pour récupérer une feature complète par ID

          // Remplacer la géométrie simplifiée par la complète
          feature.setGeometry(
            new GeoJSON().readGeometry(fullFeature.geometry, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857',
            })
          );

          // Mettre les propriétés complètes
          feature.setProperties(fullFeature.properties);

          setSelectedFeature(feature);

          // Calculer la position du popup (centre de la géométrie complète)
          const geometry = feature.getGeometry();
          if (!geometry) return;

          const extent = geometry.getExtent();
          const coordinate = [
            (extent[0] + extent[2]) / 2,
            (extent[1] + extent[3]) / 2,
          ];

          overlay.setPosition(coordinate);

          // Ajuster le zoom sur la géométrie complète
          map.getView().fit(geometry.getExtent(), {
            padding: [80, 80, 80, 80],
            duration: 500,
            maxZoom: 18,
          });
        } catch (err) {
          console.error('Erreur récupération détails feature :', err);
        }
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

  const onClosePopup = () => {
    setSelectedFeature(null);
    overlayRef.current?.setPosition(undefined);

    const map = mapRef.current;
    const extent = initialExtentRef.current;

    console.log(map, extent);
    if (map && extent) {
      map.getView().fit(extent, {
        padding: [60, 60, 60, 60],
        duration: 500,
        maxZoom: 12,
      });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div id="map" style={{ height: '750px', width: '100%' }} />

      <div ref={popupRef}>
        {selectedFeature && (
          <FeaturePopup
            feature={selectedFeature}
            coordinate={selectedFeature.getGeometry()}
            onClose={onClosePopup}
          />
        )}
      </div>
    </div>
  );
}
