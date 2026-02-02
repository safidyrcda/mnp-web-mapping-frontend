'use client';

import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

export default function MapLibreMap() {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json', // style open-source
      center: [47.5, -18.9], // Madagascar
      zoom: 6,
    });

    // Charger ton API NestJS
    fetch('http://127.0.0.1:3000/data')
      .then((res) => res.json())
      .then((geojson) => {
        map.on('load', () => {
          map.addSource('zones', {
            type: 'geojson',
            data: geojson,
          });
          map.addLayer({
            id: 'zones-fill',
            type: 'fill',
            source: 'zones',
            paint: {
              'fill-color': '#088',
              'fill-opacity': 0.5,
            },
          });
          map.addLayer({
            id: 'zones-outline',
            type: 'line',
            source: 'zones',
            paint: {
              'line-color': '#000',
              'line-width': 2,
            },
          });
        });
      });
  }, []);

  return <div id="map" style={{ height: '600px' }}></div>;
}
