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

  const defaultCenter: [number, number] = [18.5304, 73.8467];

  // Warm Spectrum: Sand -> Muted Ochre -> Copper -> Terracotta -> Deep Terracotta (NO BLUE, NO GREEN)
  const getFeatureColor = (feat: GeoJSONFeature) => {
    const p = feat.properties;

    if (activeLayer === 'risk') {
      const r = p.risk_score;
      if (r >= 90) return { fill: '#9F4937', stroke: '#752E20', fillOpacity: 0.82 }; // Extreme (Deep Terracotta)
      if (r >= 80) return { fill: '#C9674B', stroke: '#9C462E', fillOpacity: 0.75 }; // Very High (Terracotta)
      if (r >= 60) return { fill: '#B86B45', stroke: '#874A2C', fillOpacity: 0.68 }; // High (Copper)
      if (r >= 40) return { fill: '#C59A4A', stroke: '#8F6B26', fillOpacity: 0.58 }; // Moderate (Muted Ochre / Warm Gold)
      return { fill: '#D5C9B8', stroke: '#A89984', fillOpacity: 0.45 }; // Low (Muted Sand)
    }

    if (activeLayer === 'lst') {
      const lst = p.lst_celsius;
      if (lst >= 45) return { fill: '#9F4937', stroke: '#752E20', fillOpacity: 0.82 };
      if (lst >= 42) return { fill: '#C9674B', stroke: '#9C462E', fillOpacity: 0.75 };
      if (lst >= 39) return { fill: '#B86B45', stroke: '#874A2C', fillOpacity: 0.68 };
      if (lst >= 36) return { fill: '#C59A4A', stroke: '#8F6B26', fillOpacity: 0.58 };
      return { fill: '#D5C9B8', stroke: '#A89984', fillOpacity: 0.45 };
    }

    if (activeLayer === 'ndvi') {
      const ndvi = p.baseline_ndvi;
      if (ndvi >= 0.50) return { fill: '#8E9274', stroke: '#61654D', fillOpacity: 0.70 }; // High canopy (Muted olive-beige)
      if (ndvi >= 0.30) return { fill: '#B6B9A1', stroke: '#868A70', fillOpacity: 0.60 }; // Moderate
      if (ndvi >= 0.18) return { fill: '#C59A4A', stroke: '#8F6B26', fillOpacity: 0.60 }; // Low
      return { fill: '#9F4937', stroke: '#752E20', fillOpacity: 0.75 }; // Acute Deficit
    }

    if (activeLayer === 'population') {
      const pop = p.population;
      if (pop >= 25000) return { fill: '#925238', stroke: '#66321F', fillOpacity: 0.80 };
      if (pop >= 18000) return { fill: '#B86B45', stroke: '#874A2C', fillOpacity: 0.70 };
      if (pop >= 10000) return { fill: '#C59A4A', stroke: '#8F6B26', fillOpacity: 0.55 };
      return { fill: '#E7DED0', stroke: '#C2B4A0', fillOpacity: 0.45 };
    }

    if (activeLayer === 'elevation') {
      const ele = p.elevation_m;
      if (ele >= 650) return { fill: '#252321', stroke: '#141211', fillOpacity: 0.78 }; // Tekdi
      if (ele >= 580) return { fill: '#6F6961', stroke: '#4D4741', fillOpacity: 0.65 };
      if (ele >= 560) return { fill: '#A89984', stroke: '#7E705E', fillOpacity: 0.55 };
      return { fill: '#E7DED0', stroke: '#C2B4A0', fillOpacity: 0.45 }; // Basin
    }

    if (activeLayer === 'built_up') {
      const b = p.built_up_density;
      if (b >= 0.85) return { fill: '#9F4937', stroke: '#752E20', fillOpacity: 0.82 };
      if (b >= 0.70) return { fill: '#C9674B', stroke: '#9C462E', fillOpacity: 0.72 };
      if (b >= 0.40) return { fill: '#C59A4A', stroke: '#8F6B26', fillOpacity: 0.58 };
      return { fill: '#8E9274', stroke: '#61654D', fillOpacity: 0.50 };
    }

    return { fill: '#D5C9B8', stroke: '#A89984', fillOpacity: 0.50 };
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E7DED0] bg-[#EFEAE0] shadow-2xs" style={{ height }}>
      {/* Top Map Layer & Horizon Controls Overlay */}
      <div className="absolute top-4 left-4 z-400 flex flex-wrap items-center gap-2 bg-[#FBF9F4]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E7DED0] shadow-sm">
        {/* Horizon Toggle */}
        {onHorizonChange && (
          <div className="flex items-center bg-[#F5F1E8] p-1 rounded-xl border border-[#E7DED0] mr-1">
            <button
              onClick={() => onHorizonChange(24)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                horizon === 24
                  ? 'bg-[#B86B45] text-[#FBF9F4] shadow-xs'
                  : 'text-[#6F6961] hover:text-[#252321]'
              }`}
            >
              24h Forecast
            </button>
            <button
              onClick={() => onHorizonChange(48)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                horizon === 48
                  ? 'bg-[#B86B45] text-[#FBF9F4] shadow-xs'
                  : 'text-[#6F6961] hover:text-[#252321]'
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'risk'
                ? 'bg-[#B86B45] text-[#FBF9F4] border-[#B86B45] shadow-xs'
                : 'bg-[#FBF9F4] text-[#6F6961] border-[#E7DED0] hover:bg-[#F5F1E8]'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Heat Risk</span>
          </button>

          <button
            onClick={() => handleLayerSelect('lst')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'lst'
                ? 'bg-[#B86B45] text-[#FBF9F4] border-[#B86B45] shadow-xs'
                : 'bg-[#FBF9F4] text-[#6F6961] border-[#E7DED0] hover:bg-[#F5F1E8]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>LST (°C)</span>
          </button>

          <button
            onClick={() => handleLayerSelect('ndvi')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'ndvi'
                ? 'bg-[#B86B45] text-[#FBF9F4] border-[#B86B45] shadow-xs'
                : 'bg-[#FBF9F4] text-[#6F6961] border-[#E7DED0] hover:bg-[#F5F1E8]'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            <span>NDVI Canopy</span>
          </button>

          <button
            onClick={() => handleLayerSelect('built_up')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'built_up'
                ? 'bg-[#B86B45] text-[#FBF9F4] border-[#B86B45] shadow-xs'
                : 'bg-[#FBF9F4] text-[#6F6961] border-[#E7DED0] hover:bg-[#F5F1E8]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Urban Density</span>
          </button>

          <button
            onClick={() => handleLayerSelect('population')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeLayer === 'population'
                ? 'bg-[#B86B45] text-[#FBF9F4] border-[#B86B45] shadow-xs'
                : 'bg-[#FBF9F4] text-[#6F6961] border-[#E7DED0] hover:bg-[#F5F1E8]'
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Polygons for each micro-grid cell (~250m) */}
        {features.map((feat) => {
          const p = feat.properties;
          const isSelected = selectedZoneId === p.zone_id;
          const colors = getFeatureColor(feat);

          const coords = feat.geometry.coordinates[0].map(([lat, lon]) => [lat, lon] as [number, number]);

          return (
            <Polygon
              key={`${feat.id}-${activeLayer}`}
              positions={coords}
              pathOptions={{
                fillColor: colors.fill,
                fillOpacity: isSelected ? 0.92 : colors.fillOpacity,
                color: isSelected ? '#252321' : colors.stroke,
                weight: isSelected ? 3.5 : 1.5,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectZone) onSelectZone(feat);
                },
              }}
            >
              <Tooltip sticky direction="top" className="custom-map-tooltip">
                <div className="p-1 min-w-[200px] text-[#252321] font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-[#E7DED0] pb-1 mb-1">
                    <span className="font-extrabold text-xs text-[#252321]">{p.zone_name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#252321] text-[#FBF9F4]">
                      {p.risk_score}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                    <div>
                      <span className="text-[#6F6961]">Micro Temp:</span>{' '}
                      <span className="font-bold text-[#9F4937]">{p.predicted_temp}°C</span>
                    </div>
                    <div>
                      <span className="text-[#6F6961]">Anomaly:</span>{' '}
                      <span className="font-bold text-[#C9674B]">+{p.temp_anomaly}°C</span>
                    </div>
                    <div>
                      <span className="text-[#6F6961]">NDVI:</span>{' '}
                      <span className="font-medium text-[#252321]">{p.baseline_ndvi.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#6F6961]">Exposed:</span>{' '}
                      <span className="font-medium text-[#252321]">{p.population.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-[#6F6961] italic leading-tight">
                    Click to view full explainable AI intelligence
                  </p>
                </div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay in Warm Ivory */}
      <div className="absolute bottom-4 right-4 z-400 bg-[#FBF9F4]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E7DED0] shadow-md max-w-xs">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-xs font-bold text-[#252321] uppercase tracking-wider">
            {activeLayer === 'risk' && 'Heat Risk Index'}
            {activeLayer === 'lst' && 'Surface LST (°C)'}
            {activeLayer === 'ndvi' && 'NDVI Vegetation Index'}
            {activeLayer === 'built_up' && 'Built-Up Density'}
            {activeLayer === 'population' && 'Population Density'}
          </span>
          <span className="text-[10px] font-mono text-[#6F6961]">~250m Grid</span>
        </div>

        {activeLayer === 'risk' && (
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#9F4937]" />
                <span className="font-semibold text-[#9F4937]">Extreme</span>
              </span>
              <span className="font-mono text-[11px] text-[#6F6961]">90 – 100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#C9674B]" />
                <span className="font-semibold text-[#A0462C]">Very High</span>
              </span>
              <span className="font-mono text-[11px] text-[#6F6961]">80 – 89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#B86B45]" />
                <span className="font-semibold text-[#925238]">High</span>
              </span>
              <span className="font-mono text-[11px] text-[#6F6961]">60 – 79</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#C59A4A]" />
                <span className="font-semibold text-[#8E6A26]">Moderate</span>
              </span>
              <span className="font-mono text-[11px] text-[#6F6961]">40 – 59</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#D5C9B8]" />
                <span className="font-semibold text-[#6F6961]">Low</span>
              </span>
              <span className="font-mono text-[11px] text-[#6F6961]">0 – 39</span>
            </div>
          </div>
        )}

        {activeLayer !== 'risk' && (
          <div className="text-[11px] text-[#6F6961] space-y-1">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#D5C9B8] via-[#C59A4A] to-[#9F4937]" />
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
