import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { GeoJSONCollection, GeoJSONFeature } from '../types';
import { HeatMapLeaflet, MapLayerType } from '../components/map/HeatMapLeaflet';
import { ZoneIntelligencePanel } from '../components/zones/ZoneIntelligencePanel';
import { OfficerBanner } from '../components/common/OfficerBanner';
import {
  Filter,
  Layers,
  Thermometer,
  TreePine,
  Users,
  Mountain,
  Building,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

export const HeatMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { scenario } = useScenario();
  const { role, officerInfo } = useAuth();

  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [horizon, setHorizon] = useState<number>(24);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [popFilter, setPopFilter] = useState<string>('all');
  const [ndviFilter, setNdviFilter] = useState<string>('all');
  const [activeLayer, setActiveLayer] = useState<MapLayerType>(officerInfo.defaultMapLayer);

  // Synchronize active layer when officer role changes
  useEffect(() => {
    setActiveLayer(officerInfo.defaultMapLayer);
  }, [role, officerInfo]);

  const loadHeatmap = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getHeatmap(
        scenario,
        horizon,
        riskFilter,
        popFilter,
        ndviFilter
      );
      setGeoData(data);
      if (data.features.length > 0 && !selectedFeature) {
        setSelectedFeature(data.features[0]);
      }
    } catch (e) {
      console.error('Failed to load heatmap data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmap();
  }, [scenario, horizon, riskFilter, popFilter, ndviFilter]);

  const resetFilters = () => {
    setHorizon(24);
    setRiskFilter('all');
    setPopFilter('all');
    setNdviFilter('all');
    setActiveLayer(officerInfo.defaultMapLayer);
  };

  const handleDispatchTanker = async (zoneId: string, zoneName: string) => {
    try {
      await apiService.createIntervention({
        zone_id: zoneId,
        title: `Water Tanker Fleet — ${zoneName}`,
        intervention_type: 'Water Tanker',
        priority: 'CRITICAL',
        target_location: zoneName,
        reason: `Dispatched from GIS Heat Map for high-risk cell ${zoneId}`,
        suggested_dispatch: '2 Tankers (10,000L)',
        assigned_department: officerInfo.department,
        scenario: scenario,
      });
      navigate('/interventions');
    } catch {
      navigate('/interventions');
    }
  };

  const layerDescriptions: Record<MapLayerType, { title: string; desc: string }> = {
    risk: { title: 'Composite Heat Risk Score (0-100)', desc: 'Multi-criteria index combining thermal intensity, canopy deficit, built-up density, and population exposure.' },
    lst: { title: 'Land Surface Temperature (LST °C)', desc: 'Radiometric thermal emission capturing radiant surface heat from concrete, asphalt, and rooftops.' },
    ndvi: { title: 'Normalized Difference Vegetation Index (NDVI)', desc: 'Tree canopy density & green cover index. Low values (< 0.15) identify extreme urban shade deficits.' },
    built_up: { title: 'Built-Up Density (0.0 - 1.0)', desc: 'Impervious surface ratio capturing building thermal mass and concrete heat entrapment.' },
    population: { title: 'Population Exposure (Citizens per Grid)', desc: 'Demographic density overlay highlighting vulnerable residential clusters and transit hubs.' },
    elevation: { title: 'Topographical Elevation (Meters)', desc: 'SRTM elevation model. Valley basins experience heat stagnation due to trapped atmospheric inversion.' },
  };

  return (
    <div className="space-y-4">
      {/* Officer Directive HUD */}
      <OfficerBanner compact />

      {/* Page Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              City Heat Map GIS (~250m Resolution)
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#8E9274]/15 text-[#4E523A] border border-[#8E9274]/30 rounded-md uppercase tracking-wider">
              Vector Polygons
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Spatial downscaling layer: <span className="font-bold text-[#252321]">{layerDescriptions[activeLayer].title}</span> • Tailored for {officerInfo.department}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FBF9F4] hover:bg-[#F5F1E8] border border-[#E7DED0] text-xs font-bold text-[#6F6961] rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layers</span>
          </button>
        </div>
      </div>

      {/* Main Map + Intelligence Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Leaflet GIS Map Container */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-2xs">
            {isLoading && !geoData ? (
              <div className="flex items-center justify-center h-[620px]">
                <div className="w-8 h-8 border-3 border-[#B86B45] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : geoData ? (
              <HeatMapLeaflet
                features={geoData.features}
                selectedZoneId={selectedFeature?.properties.zone_id}
                onSelectZone={(f) => setSelectedFeature(f)}
                height="620px"
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                horizon={horizon}
                onHorizonChange={setHorizon}
              />
            ) : null}
          </div>
        </div>

        {/* Selected Zone Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {selectedFeature ? (
            <ZoneIntelligencePanel
              feature={selectedFeature}
              onClose={() => setSelectedFeature(null)}
              onDispatchTanker={handleDispatchTanker}
            />
          ) : (
            <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-6 text-center shadow-2xs space-y-3">
              <Layers className="w-10 h-10 text-[#A98245] mx-auto opacity-40" />
              <h3 className="font-bold text-sm text-[#252321]">Click a Polygon Cell to Inspect</h3>
              <p className="text-xs text-[#6F6961] leading-relaxed">
                Click any 250m microclimate grid on the map to inspect localized downscaling equations, land cover contributions, and SHAP explainability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
