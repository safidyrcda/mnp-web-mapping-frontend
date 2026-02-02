'use client'

import { useEffect } from 'react'
import L from 'leaflet'

export default function Map() {
  useEffect(() => {
    const map = L.map('map').setView([-18.9, 47.5], 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map)

    // Appel de ton service NestJS
    fetch('http://localhost:3000/data')
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          onEachFeature: (feature, layer) => {
            layer.bindPopup(
              `${feature.properties.nom} - projets: ${feature.properties.nb_projet}`
            )
          }
        }).addTo(map)
      })
  }, [])

  return <div id="map" style={{ height: '600px' }}></div>
}
