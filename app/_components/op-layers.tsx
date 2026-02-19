'use client';

import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';

import Map from 'ol/Map';
import View from 'ol/View';

import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';

import { Fill, Stroke, Style } from 'ol/style';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import { fetchData, fetchOne } from '../../components/api';
import FeaturePopup from '@/app/_components/popup';
import { Extent } from 'ol/extent';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import { ProtectedArea } from '@/lib/schemas';

type Props = {
  selectedArea?: ProtectedArea;
};

export default function OpenLayersMap({ selectedArea }: Props) {
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const popupRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const initialExtentRef = useRef<Extent | null>(null);

  const vectorLayerRef = useRef<VectorLayer<any> | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const lastSelectedFeatureRef = useRef<any>(null);
  const typeColors: Record<string, string> = {
    PN: '#2ecc71',
    RS: '#014d23',
    RNI: '#b86f09',
  };

  const styleCacheRef = useRef<Record<string, Style>>({});
  const selectedStyleCacheRef = useRef<Record<string, Style>>({});

  const getStyleByType = (feature: any) => {
    const type = feature.get('status');
    const color = typeColors[type] || '#95a5a6';

    const cache = styleCacheRef.current;

    if (!cache[type]) {
      cache[type] = new Style({
        fill: new Fill({ color }),
      });
    }

    return cache[type];
  };

  const getSelectedStyleByType = (feature: any) => {
    const type = feature.get('status');
    const color = typeColors[type] || '#95a5a6';

    const cache = selectedStyleCacheRef.current;

    if (!cache[type]) {
      cache[type] = new Style({
        fill: new Fill({ color: color + '67' }),
        stroke: new Stroke({
          color,
          width: 3,
        }),
      });
    }

    return cache[type];
  };

  const selectFeatureById = async (id: string) => {
    const map = mapRef.current;
    const source = vectorSourceRef.current;
    const overlay = overlayRef.current;

    if (!map || !source || !overlay) return;

    if (lastSelectedFeatureRef.current) {
      lastSelectedFeatureRef.current.setStyle(undefined);
      lastSelectedFeatureRef.current = null;
    }

    const feature = source.getFeatures().find((f) => f.get('id') === id);
    if (!feature) return;

    const fullFeature = await fetchOne(id);

    feature.setGeometry(
      new GeoJSON().readGeometry(fullFeature.geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    );

    feature.setProperties(fullFeature.properties);

    feature.setStyle(getSelectedStyleByType);

    lastSelectedFeatureRef.current = feature;

    const geometry = feature.getGeometry();
    if (!geometry) return;

    const extent = geometry.getExtent();
    const coordinate = [
      (extent[0] + extent[2]) / 2,
      (extent[1] + extent[3]) / 2,
    ];

    setSelectedFeature(feature);
    overlay.setPosition(coordinate);

    map.getView().fit(extent, {
      padding: [80, 80, 80, 80],
      duration: 500,
      maxZoom: 18,
    });
  };

  useEffect(() => {
    console.log('Selected area changed:', selectedArea);
    if (selectedArea?.id) {
      selectFeatureById(selectedArea.id);
    }
  }, [selectedArea]);

  useEffect(() => {
    let map: Map;

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

      const overlay = new Overlay({
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
      vectorSourceRef.current = vectorSource;

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: getStyleByType,
      });

      vectorLayerRef.current = vectorLayer;
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
        style: getSelectedStyleByType,
      });

      map.addInteraction(clickSelect);

      clickSelect.on('select', (e) => {
        const feature = e.selected[0];
        if (!feature) {
          setSelectedFeature(null);
          overlay.setPosition(undefined);
          return;
        }

        const id = feature.get('id');
        selectFeatureById(id);
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
    if (lastSelectedFeatureRef.current) {
      lastSelectedFeatureRef.current.setStyle(undefined);
      lastSelectedFeatureRef.current = null;
    }

    setSelectedFeature(null);
    overlayRef.current?.setPosition(undefined);

    const map = mapRef.current;
    const extent = initialExtentRef.current;

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
      <div id="map" style={{ height: '650px', width: '100%' }} />

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
