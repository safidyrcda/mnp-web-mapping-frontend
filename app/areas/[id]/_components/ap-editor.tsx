'use client';

import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';

import {
  Fill,
  Stroke,
  Style,
  Icon,
  Circle as CircleStyle,
  Text,
} from 'ol/style';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { fromLonLat, toLonLat } from 'ol/proj';
import { getDistance } from 'ol/sphere';
import { XYZ } from 'ol/source';
import { MapPin, Trash2, Plus, X } from 'lucide-react';
import { fetchOne } from '@/components/api';

type Props = {
  areaId: string;
};

type DrawnZone = {
  id: string;
  type: 'Polygon' | 'Circle' | 'Rectangle';
  feature: Feature;
  area?: number;
  perimeter?: number;
};

export default function ProtectedAreaEditor({ areaId }: Props) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const protectedAreaLayerRef = useRef<VectorLayer<any> | null>(null);
  const drawingSourceRef = useRef<VectorSource | null>(null);
  const drawingLayerRef = useRef<VectorLayer<any> | null>(null);
  const searchMarkerSourceRef = useRef<VectorSource | null>(null);

  const [drawingMode, setDrawingMode] = useState<
    'rectangle' | 'circle' | 'polygon' | null
  >(null);
  const [drawnZones, setDrawnZones] = useState<DrawnZone[]>([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [searchResult, setSearchResult] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const drawInteractionRef = useRef<Draw | null>(null);
  const modifyInteractionRef = useRef<Modify | null>(null);
  const snapInteractionRef = useRef<Snap | null>(null);

  // SIG Styling
  const protectedAreaStyle = new Style({
    fill: new Fill({
      color: 'rgba(52, 152, 219, 0.15)',
    }),
    stroke: new Stroke({
      color: '#3498db',
      width: 2,
    }),
  });

  const drawingStyle = new Style({
    fill: new Fill({
      color: 'rgba(46, 204, 113, 0.25)',
    }),
    stroke: new Stroke({
      color: '#27ae60',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: '#27ae60' }),
      stroke: new Stroke({ color: 'white', width: 1 }),
    }),
  });

  const searchMarkerStyle = new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: '#e74c3c' }),
      stroke: new Stroke({ color: 'white', width: 2 }),
    }),
  });

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new Map({
      target: containerRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            attributions: '© OpenStreetMap contributors, © CARTO',
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 3,
      }),
    });

    mapRef.current = map;

    // Protected area layer
    const protectedAreaSource = new VectorSource();
    const protectedAreaLayer = new VectorLayer({
      source: protectedAreaSource,
      style: protectedAreaStyle,
      zIndex: 10,
    });
    protectedAreaLayerRef.current = protectedAreaLayer;
    map.addLayer(protectedAreaLayer);

    // Drawing layer
    const drawingSource = new VectorSource();
    drawingSourceRef.current = drawingSource;
    const drawingLayer = new VectorLayer({
      source: drawingSource,
      style: drawingStyle,
      zIndex: 20,
    });
    drawingLayerRef.current = drawingLayer;
    map.addLayer(drawingLayer);

    // Search marker layer
    const searchMarkerSource = new VectorSource();
    searchMarkerSourceRef.current = searchMarkerSource;
    const searchMarkerLayer = new VectorLayer({
      source: searchMarkerSource,
      style: searchMarkerStyle,
      zIndex: 30,
    });
    map.addLayer(searchMarkerLayer);

    // Modify interaction
    const modify = new Modify({ source: drawingSource });
    modifyInteractionRef.current = modify;
    map.addInteraction(modify);

    // Snap interaction
    const snap = new Snap({ source: drawingSource });
    snapInteractionRef.current = snap;
    map.addInteraction(snap);

    // Load protected area
    loadProtectedArea(map, protectedAreaSource);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  const loadProtectedArea = async (map: Map, source: VectorSource) => {
    try {
      setLoading(true);
      const geojson = await fetchOne(areaId);
      const features = new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      features.forEach((feature) => source.addFeature(feature));

      // Fit map to area
      const extent = source.getExtent();
      if (extent && map) {
        map.getView().fit(extent, {
          padding: [50, 50, 50, 350],
          maxZoom: 16,
        });
      }

      setErrorMessage('');
    } catch (error) {
      console.error('Error loading protected area:', error);
      setErrorMessage('Failed to load protected area');
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (mode: 'rectangle' | 'circle' | 'polygon') => {
    const map = mapRef.current;
    if (!map || !drawingSourceRef.current) return;

    // Remove previous draw interaction
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
    }

    let drawType: 'Circle' | 'Polygon';
    if (mode === 'rectangle') {
      drawType = 'Circle';
    } else if (mode === 'circle') {
      drawType = 'Circle';
    } else {
      drawType = 'Polygon';
    }

    const draw = new Draw({
      source: drawingSourceRef.current,
      type: drawType,
      style: drawingStyle,
    });

    drawInteractionRef.current = draw;
    map.addInteraction(draw);
    setDrawingMode(mode);

    draw.on('drawend', (evt) => {
      const feature = evt.feature;
      const geometry = feature.getGeometry();

      // Calculate geometry properties
      const zoneType: 'Polygon' | 'Circle' | 'Rectangle' = mode as any;
      let area: number | undefined;
      let perimeter: number | undefined;

      if (geometry instanceof Polygon) {
        area = geometry.getArea();
        const coords = geometry.getCoordinates()[0];
        perimeter = calculatePerimeter(coords);
      } else if (geometry instanceof Circle) {
        const radius = geometry.getRadius();
        area = Math.PI * radius * radius;
        perimeter = 2 * Math.PI * radius;
      }

      const zoneId = `zone_${Date.now()}`;
      const newZone: DrawnZone = {
        id: zoneId,
        type: zoneType,
        feature,
        area,
        perimeter,
      };

      setDrawnZones([...drawnZones, newZone]);
      setDrawingMode(null);

      // Remove draw interaction
      if (map && drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
      }
    });
  };

  const calculatePerimeter = (coordinates: any[]): number => {
    let perimeter = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const from = toLonLat(coordinates[i]);
      const to = toLonLat(coordinates[i + 1]);
      perimeter += getDistance(from, to);
    }
    return perimeter;
  };

  const searchCoordinate = () => {
    if (!latitude || !longitude) {
      setErrorMessage('Please enter both latitude and longitude');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setErrorMessage('Invalid coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setErrorMessage('Latitude must be between -90 and 90');
      return;
    }

    if (lon < -180 || lon > 180) {
      setErrorMessage('Longitude must be between -180 and 180');
      return;
    }

    const map = mapRef.current;
    if (!map || !searchMarkerSourceRef.current) return;

    // Clear previous marker
    searchMarkerSourceRef.current.clear();

    // Add marker
    const coordinate = fromLonLat([lon, lat]);
    const marker = new Feature({
      geometry: new Point(coordinate),
    });

    searchMarkerSourceRef.current.addFeature(marker);

    // Center map on coordinate
    map.getView().animate({
      center: coordinate,
      zoom: 15,
      duration: 500,
    });

    setSearchResult({ lat, lon });
    setErrorMessage('');
  };

  const deleteZone = (zoneId: string) => {
    const zone = drawnZones.find((z) => z.id === zoneId);
    if (!zone || !drawingSourceRef.current) return;

    drawingSourceRef.current.removeFeature(zone.feature);
    setDrawnZones(drawnZones.filter((z) => z.id !== zoneId));
  };

  const clearAllZones = () => {
    if (!drawingSourceRef.current) return;
    drawingSourceRef.current.clear();
    setDrawnZones([]);
  };

  const cancelDrawing = () => {
    const map = mapRef.current;
    if (drawInteractionRef.current && map) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    setDrawingMode(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        gap: 0,
        position: 'relative',
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: '350px',
          background: '#fff',
          borderRight: '1px solid #ecf0f1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #ecf0f1',
            background: '#f8f9fa',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#2c3e50',
            }}
          >
            Zone Editor
          </h1>
          <p
            style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#7f8c8d' }}
          >
            Search & Draw Restoration Zones
          </p>
        </div>

        {/* Coordinate Search Section */}
        <div style={{ padding: '20px', borderBottom: '1px solid #ecf0f1' }}>
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: 600,
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <MapPin
              size={14}
              style={{ display: 'inline', marginRight: '6px' }}
            />
            Coordinate Search
          </h3>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  marginBottom: '4px',
                  color: '#7f8c8d',
                  textTransform: 'uppercase',
                }}
              >
                Latitude
              </label>
              <input
                type="number"
                placeholder="-90 to 90"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                step="0.0001"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #bdc3c7',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  marginBottom: '4px',
                  color: '#7f8c8d',
                  textTransform: 'uppercase',
                }}
              >
                Longitude
              </label>
              <input
                type="number"
                placeholder="-180 to 180"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                step="0.0001"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #bdc3c7',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            onClick={searchCoordinate}
            style={{
              width: '100%',
              padding: '10px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            Search Location
          </button>

          {searchResult && (
            <div
              style={{
                padding: '10px',
                background: '#d5f4e6',
                border: '1px solid #27ae60',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#27ae60',
              }}
            >
              Found: {searchResult.lat.toFixed(4)},{' '}
              {searchResult.lon.toFixed(4)}
            </div>
          )}
        </div>

        {/* Drawing Tools Section */}
        <div style={{ padding: '20px', borderBottom: '1px solid #ecf0f1' }}>
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: 600,
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <Plus size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Drawing Tools
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => startDrawing('rectangle')}
              disabled={drawingMode !== null}
              style={{
                padding: '10px',
                background: drawingMode === 'rectangle' ? '#27ae60' : '#ecf0f1',
                color: drawingMode === 'rectangle' ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '4px',
                cursor: drawingMode === null ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 600,
                opacity:
                  drawingMode !== null && drawingMode !== 'rectangle' ? 0.5 : 1,
              }}
            >
              {drawingMode === 'rectangle'
                ? 'Drawing Rectangle...'
                : 'Rectangle'}
            </button>

            <button
              onClick={() => startDrawing('circle')}
              disabled={drawingMode !== null}
              style={{
                padding: '10px',
                background: drawingMode === 'circle' ? '#27ae60' : '#ecf0f1',
                color: drawingMode === 'circle' ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '4px',
                cursor: drawingMode === null ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 600,
                opacity:
                  drawingMode !== null && drawingMode !== 'circle' ? 0.5 : 1,
              }}
            >
              {drawingMode === 'circle' ? 'Drawing Circle...' : 'Circle'}
            </button>

            <button
              onClick={() => startDrawing('polygon')}
              disabled={drawingMode !== null}
              style={{
                padding: '10px',
                background: drawingMode === 'polygon' ? '#27ae60' : '#ecf0f1',
                color: drawingMode === 'polygon' ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '4px',
                cursor: drawingMode === null ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 600,
                opacity:
                  drawingMode !== null && drawingMode !== 'polygon' ? 0.5 : 1,
              }}
            >
              {drawingMode === 'polygon' ? 'Drawing Polygon...' : 'Polygon'}
            </button>

            {drawingMode && (
              <button
                onClick={cancelDrawing}
                style={{
                  padding: '10px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Cancel Drawing
              </button>
            )}
          </div>
        </div>

        {/* Drawn Zones Section */}
        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 600,
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Zones ({drawnZones.length})
            </h3>
            {drawnZones.length > 0 && (
              <button
                onClick={clearAllZones}
                style={{
                  padding: '4px 8px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {drawnZones.map((zone) => (
              <div
                key={zone.id}
                style={{
                  padding: '10px',
                  background: '#f8f9fa',
                  border: '1px solid #ecf0f1',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#2c3e50' }}>
                    {zone.type}
                  </span>
                  <button
                    onClick={() => deleteZone(zone.id)}
                    style={{
                      padding: '2px 6px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>

                {zone.area && (
                  <div style={{ color: '#7f8c8d', marginBottom: '3px' }}>
                    Area: {(zone.area / 1e6).toFixed(2)} km²
                  </div>
                )}
                {zone.perimeter && (
                  <div style={{ color: '#7f8c8d' }}>
                    Perimeter: {(zone.perimeter / 1000).toFixed(2)} km
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 20px',
              background: '#fadbd8',
              color: '#c0392b',
              borderTop: '1px solid #ecf0f1',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#c0392b',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          background: '#ecf0f1',
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.9)',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #ecf0f1',
                  borderTop: '4px solid #27ae60',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px',
                }}
              />
              <p style={{ color: '#2c3e50', fontSize: '14px' }}>
                Loading protected area...
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
