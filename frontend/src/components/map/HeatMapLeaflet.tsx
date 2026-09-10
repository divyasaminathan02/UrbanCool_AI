import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import { GeoJSONFeature } from '../../types';
import { Layers, Thermometer, Eye, TreePine, Users, Mountain, Building } from 'lucide-react';

export type MapLayerType = 'risk' | 'lst' | 'ndvi' | 'population' | 'elevation' | 'built_up';

interface HeatMapLeafletProps {
  features: GeoJSONFeature[];
  selectedZoneId?: string | null;
  onSelectZone?: (feature: GeoJSONFeature) => void;
  height?: string;
  activeLayer?: MapLayerType;
  onLayerChange?: (layer: MapLayerType) => void;
  horizon?: number;
  onHorizonChange?: (h: number) => void;
}

// Center helper to reset map center smoothly
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const HeatMapLeaflet: React.FC<HeatMapLeafletProps> = ({
  features,
  selectedZoneId,
  onSelectZone,
  height = '540px',
  activeLayer: propActiveLayer,
  onLayerChange,
  horizon = 24,
  onHorizonChange,
}) => {
  const [internalLayer, setInternalLayer] = useState<MapLayerType>('risk');
  const activeLayer = propActiveLayer || internalLayer;

  const handleLayerSelect = (layer: MapLayerType) => {
    if (onLayerChange) onLayerChange(layer);
    else setInternalLayer(layer);
  };

  // Pune default center
  const defaultCenter: [number, number] = [18.5304, 73.8467];

  // Helper color logic based on active layer
  const getFeatureColor = (feat: GeoJSONFeature) => {
    const p = feat.properties;

    if (activeLayer === 'risk') {
      const r = p.risk_score;
      if (r >= 90) return { fill: '#D9534F', stroke: '#9E2420', fillOpacity: 0.75 }; // Extreme
      if (r >= 80) return { fill: '#EF8069', stroke: '#C24D36', fillOpacity: 0.70 }; // Very High
      if (r >= 60) return { fill: '#F4B942', stroke: '#C28913', fillOpacity: 0.65 }; // High (amber)
      if (r >= 40) return { fill: '#E6D35C', stroke: '#B3A127', fillOpacity: 0.55 }; // Moderate
      return { fill: '#18B6A4', stroke: '#0D8F82', fillOpacity: 0.50 }; // Low
    }

    if (activeLayer === 'lst') {
      const lst = p.lst_celsius;
      if (lst >= 45) return { fill: '#990000', stroke: '#660000', fillOpacity: 0.75 };
      if (lst >= 42) return { fill: '#D9534F', stroke: '#9E2420', fillOpacity: 0.70 };
      if (lst >= 39) return { fill: '#EF8069', stroke: '#C24D36', fillOpacity: 0.65 };
      if (lst >= 36) return { fill: '#F4B942', stroke: '#C28913', fillOpacity: 0.60 };
      return { fill: '#18B6A4', stroke: '#0D8F82', fillOpacity: 0.50 };
    }

    if (activeLayer === 'ndvi') {
      const ndvi = p.baseline_ndvi;
      if (ndvi >= 0.50) return { fill: '#1A7A4C', stroke: '#0F5432', fillOpacity: 0.75 }; // High green
      if (ndvi >= 0.30) return { fill: '#5CB85C', stroke: '#3E8E3E', fillOpacity: 0.65 }; // Moderate
      if (ndvi >= 0.18) return { fill: '#F4B942', stroke: '#C28913', fillOpacity: 0.60 }; // Low
      return { fill: '#D9534F', stroke: '#9E2420', fillOpacity: 0.70 }; // Acute Deficit
    }

    if (activeLayer === 'population') {
      const pop = p.population;
      if (pop >= 25000) return { fill: '#6B21A8', stroke: '#4C1D95', fillOpacity: 0.75 };
      if (pop >= 18000) return { fill: '#9333EA', stroke: '#6B21A8', fillOpacity: 0.65 };
      if (pop >= 10000) return { fill: '#C084FC', stroke: '#9333EA', fillOpacity: 0.55 };
      return { fill: '#E9D5FF', stroke: '#C084FC', fillOpacity: 0.45 };
    }

    if (activeLayer === 'elevation') {
      const ele = p.elevation_m;
      if (ele >= 650) return { fill: '#1E293B', stroke: '#0F172A', fillOpacity: 0.75 }; // High Tekdi
      if (ele >= 580) return { fill: '#475569', stroke: '#334155', fillOpacity: 0.65 };
      if (ele >= 560) return { fill: '#94A3B8', stroke: '#64748B', fillOpacity: 0.55 };
      return { fill: '#CBD5E1', stroke: '#94A3B8', fillOpacity: 0.50 }; // Low Basin
    }

    if (activeLayer === 'built_up') {
      const b = p.built_up_density;
      if (b >= 0.85) return { fill: '#B91C1C', stroke: '#7F1D1D', fillOpacity: 0.75 };
      if (b >= 0.70) return { fill: '#EA580C', stroke: '#9A3412', fillOpacity: 0.65 };
      if (b >= 0.40) return { fill: '#F59E0B', stroke: '#B45309', fillOpacity: 0.55 };
      return { fill: '#10B981', stroke: '#047857', fillOpacity: 0.50 };
    }

    return { fill: '#18B6A4', stroke: '#0D8F82', fillOpacity: 0.55 };
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#DCE4E8] bg-[#E5ECF0] shadow-sm" style={{ height }}>
      {/* Top Map Layer & Horizon Controls Overlay */}
      <div className="absolute top-4 left-4 z-400 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#DCE4E8] shadow-md">
        {/* Horizon Toggle */}
        {onHorizonChange && (
          <div className="flex items-center bg-[#F4F7F8] p-1 rounded-xl border border-[#DCE4E8] mr-1">
            <button
              onClick={() => onHorizonChange(24)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                horizon === 24
                  ? 'bg-[#12263A] text-white shadow-xs'
                  : 'text-[#617080] hover:text-[#172033]'
              }`}
            >
              24h Forecast
            </button>
            <button
              onClick={() => onHorizonChange(48)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                horizon === 48
                  ? 'bg-[#12263A] text-white shadow-xs'
                  : 'text-[#617080] hover:text-[#172033]'
              }`}
            >
              48h Outlook
            </button>
          </div>
        )}

        {/* Layer Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleLayerSelect('risk')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'risk'
                ? 'bg-[#18B6A4] text-[#12263A] border-[#18B6A4] font-bold shadow-xs'
                : 'bg-white text-[#617080] border-[#DCE4E8] hover:bg-[#F4F7F8]'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Heat Risk</span>
          </button>

          <button
            onClick={() => handleLayerSelect('lst')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'lst'
                ? 'bg-[#18B6A4] text-[#12263A] border-[#18B6A4] font-bold shadow-xs'
                : 'bg-white text-[#617080] border-[#DCE4E8] hover:bg-[#F4F7F8]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>LST (°C)</span>
          </button>

          <button
            onClick={() => handleLayerSelect('ndvi')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'ndvi'
                ? 'bg-[#18B6A4] text-[#12263A] border-[#18B6A4] font-bold shadow-xs'
                : 'bg-white text-[#617080] border-[#DCE4E8] hover:bg-[#F4F7F8]'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            <span>NDVI Canopy</span>
          </button>

          <button
            onClick={() => handleLayerSelect('built_up')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'built_up'
                ? 'bg-[#18B6A4] text-[#12263A] border-[#18B6A4] font-bold shadow-xs'
                : 'bg-white text-[#617080] border-[#DCE4E8] hover:bg-[#F4F7F8]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Urban Density</span>
          </button>

          <button
            onClick={() => handleLayerSelect('population')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'population'
                ? 'bg-[#18B6A4] text-[#12263A] border-[#18B6A4] font-bold shadow-xs'
                : 'bg-white text-[#617080] border-[#DCE4E8] hover:bg-[#F4F7F8]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Exposure</span>
          </button>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={defaultCenter} zoom={12} />
        {/* CartoDB Positron / OSM tiles for crisp enterprise visual */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Polygons for each micro-grid cell (~250m) */}
        {features.map((feat) => {
          const p = feat.properties;
          const isSelected = selectedZoneId === p.zone_id;
          const colors = getFeatureColor(feat);

          // Geometry coordinates in Leaflet format [[lat, lon], [lat, lon], ...]
          const coords = feat.geometry.coordinates[0].map(([lat, lon]) => [lat, lon] as [number, number]);

          return (
            <Polygon
              key={`${feat.id}-${activeLayer}`}
              positions={coords}
              pathOptions={{
                fillColor: colors.fill,
                fillOpacity: isSelected ? 0.90 : colors.fillOpacity,
                color: isSelected ? '#12263A' : colors.stroke,
                weight: isSelected ? 3.5 : 1.5,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectZone) onSelectZone(feat);
                },
              }}
            >
              <Tooltip sticky direction="top" className="custom-map-tooltip">
                <div className="p-1 min-w-[200px] text-[#172033]">
                  <div className="flex items-center justify-between gap-2 border-b border-[#DCE4E8] pb-1 mb-1">
                    <span className="font-bold text-xs text-[#12263A]">{p.zone_name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12263A] text-white">
                      {p.risk_score}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                    <div>
                      <span className="text-[#617080]">Micro Temp:</span>{' '}
                      <span className="font-bold text-[#D9534F]">{p.predicted_temp}°C</span>
                    </div>
                    <div>
                      <span className="text-[#617080]">Anomaly:</span>{' '}
                      <span className="font-bold text-[#C9543C]">+{p.temp_anomaly}°C</span>
                    </div>
                    <div>
                      <span className="text-[#617080]">NDVI:</span>{' '}
                      <span className="font-medium">{p.baseline_ndvi.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#617080]">Exposed:</span>{' '}
                      <span className="font-medium">{p.population.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-[#617080] italic leading-tight">
                    Click to view full explainable AI intelligence
                  </p>
                </div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-400 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#DCE4E8] shadow-lg max-w-xs">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-xs font-bold text-[#12263A] uppercase tracking-wider">
            {activeLayer === 'risk' && 'Heat Risk Index'}
            {activeLayer === 'lst' && 'Surface LST (°C)'}
            {activeLayer === 'ndvi' && 'NDVI Vegetation Index'}
            {activeLayer === 'built_up' && 'Built-Up Density'}
            {activeLayer === 'population' && 'Population Density'}
          </span>
          <span className="text-[10px] font-mono text-[#617080]">~250m Grid</span>
        </div>

        {activeLayer === 'risk' && (
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#D9534F]" />
                <span className="font-medium text-[#D9534F]">Extreme</span>
              </span>
              <span className="font-mono text-[11px] text-[#617080]">90 – 100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#EF8069]" />
                <span className="font-medium text-[#C9543C]">Very High</span>
              </span>
              <span className="font-mono text-[11px] text-[#617080]">80 – 89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#F4B942]" />
                <span className="font-medium text-[#B88114]">High</span>
              </span>
              <span className="font-mono text-[11px] text-[#617080]">60 – 79</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#E6D35C]" />
                <span className="font-medium text-[#8A7914]">Moderate</span>
              </span>
              <span className="font-mono text-[11px] text-[#617080]">40 – 59</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#18B6A4]" />
                <span className="font-medium text-[#0D8F82]">Low</span>
              </span>
              <span className="font-mono text-[11px] text-[#617080]">0 – 39</span>
            </div>
          </div>
        )}

        {activeLayer !== 'risk' && (
          <div className="text-[11px] text-[#617080] space-y-1">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#18B6A4] via-[#F4B942] to-[#D9534F]" />
            <div className="flex justify-between font-mono text-[10px]">
              <span>Low / Buffered</span>
              <span>Elevated Stress</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
