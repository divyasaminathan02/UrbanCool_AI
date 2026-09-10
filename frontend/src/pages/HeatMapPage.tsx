import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { GeoJSONCollection, GeoJSONFeature } from '../types';
import { HeatMapLeaflet, MapLayerType } from '../components/map/HeatMapLeaflet';
import { ZoneIntelligencePanel } from '../components/zones/ZoneIntelligencePanel';
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

  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [horizon, setHorizon] = useState<number>(24);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [popFilter, setPopFilter] = useState<string>('all');
  const [ndviFilter, setNdviFilter] = useState<string>('all');
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('risk');

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
    setActiveLayer('risk');
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
        assigned_department: 'Water Supply & Emergency Services',
        scenario: scenario,
      });
      navigate('/interventions');
    } catch (e) {
      navigate('/interventions');
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              Hyper-Local Heat Map GIS
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              250m Downscaled
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Multi-layer urban thermal canopy downscaling across Pune Municipal Corporation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-[#FBF9F4] border border-[#E7DED0] rounded-xl font-medium text-[#252321]">
            <span className="text-[#6F6961]">Active Grid Cells:</span>{' '}
            <span className="font-bold text-[#B86B45]">{geoData?.total_cells || 0}</span>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FBF9F4] hover:bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-semibold text-[#6F6961] hover:text-[#252321] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Left Filters + Center Map + Right Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Filter Panel (3 cols) */}
        <div className="lg:col-span-3 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7DED0] pb-2.5">
            <span className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#B86B45]" />
              GIS Layer Filters
            </span>
          </div>

          {/* Forecast Horizon */}
          <div>
            <label className="block text-[10px] font-bold text-[#6F6961] uppercase tracking-wider mb-1.5">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setHorizon(24)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  horizon === 24
                    ? 'bg-[#B86B45] text-white border-[#B86B45]'
                    : 'bg-[#F5F1E8] text-[#6F6961] border-[#E7DED0] hover:bg-[#EAE0D0]'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setHorizon(48)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  horizon === 48
                    ? 'bg-[#B86B45] text-white border-[#B86B45]'
                    : 'bg-[#F5F1E8] text-[#6F6961] border-[#E7DED0] hover:bg-[#EAE0D0]'
                }`}
              >
                48 Hours
              </button>
            </div>
          </div>

          {/* Risk Severity Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#6F6961] uppercase tracking-wider mb-1.5">
              Heat Risk Severity
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Risk Levels' },
                { id: 'high_plus', label: 'High+ (≥ 60)' },
                { id: 'very_high_plus', label: 'Very High+ (≥ 80)' },
                { id: 'extreme', label: 'Extreme Only (≥ 90)' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRiskFilter(rf.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    riskFilter === rf.id
                      ? 'bg-[#B86B45]/15 border-[#B86B45] text-[#252321] font-bold'
                      : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#EAE0D0]'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Population Exposure Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#6F6961] uppercase tracking-wider mb-1.5">
              Population Exposure
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setPopFilter('all')}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  popFilter === 'all'
                    ? 'bg-[#B86B45]/15 border-[#B86B45] text-[#252321] font-bold'
                    : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#EAE0D0]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPopFilter('high_exposure')}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  popFilter === 'high_exposure'
                    ? 'bg-[#B86B45]/15 border-[#B86B45] text-[#252321] font-bold'
                    : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#EAE0D0]'
                }`}
              >
                High (≥ 20k)
              </button>
            </div>
          </div>

          {/* Vegetation / NDVI Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#6F6961] uppercase tracking-wider mb-1.5">
              Vegetation / NDVI
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'low', label: 'Low (<0.2)' },
                { id: 'high', label: 'High' },
              ].map((nf) => (
                <button
                  key={nf.id}
                  onClick={() => setNdviFilter(nf.id)}
                  className={`py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer ${
                    ndviFilter === nf.id
                      ? 'bg-[#B86B45]/15 border-[#B86B45] text-[#252321] font-bold'
                      : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#EAE0D0]'
                  }`}
                >
                  {nf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Overlay Layer Switcher */}
          <div>
            <label className="block text-[10px] font-bold text-[#6F6961] uppercase tracking-wider mb-1.5">
              Primary Map Layer
            </label>
            <div className="space-y-1">
              {[
                { id: 'risk', label: 'Composite Heat Risk', icon: Thermometer },
                { id: 'lst', label: 'Land Surface Temp (LST)', icon: Layers },
                { id: 'ndvi', label: 'NDVI Canopy Transpiration', icon: TreePine },
                { id: 'built_up', label: 'Built-up Thermal Inertia', icon: Building },
                { id: 'population', label: 'Population Exposure', icon: Users },
                { id: 'elevation', label: 'Topographic DEM Elevation', icon: Mountain },
              ].map((l) => {
                const Icon = l.icon;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveLayer(l.id as MapLayerType)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                      activeLayer === l.id
                        ? 'bg-[#B86B45] text-white border-[#B86B45] font-bold shadow-xs'
                        : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#EAE0D0]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center GIS Map (5 cols) */}
        <div className="lg:col-span-5 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-3 shadow-xs">
          {geoData && (
            <HeatMapLeaflet
              features={geoData.features}
              selectedZoneId={selectedFeature?.properties.zone_id}
              onSelectZone={(f) => setSelectedFeature(f)}
              height="700px"
              activeLayer={activeLayer}
              onLayerChange={setActiveLayer}
              horizon={horizon}
              onHorizonChange={setHorizon}
            />
          )}
        </div>

        {/* Right Zone Intelligence Panel (4 cols) */}
        <div className="lg:col-span-4">
          {selectedFeature ? (
            <ZoneIntelligencePanel
              feature={selectedFeature}
              onClose={() => setSelectedFeature(null)}
              onDispatchTanker={handleDispatchTanker}
            />
          ) : (
            <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-8 text-center text-[#6F6961] shadow-xs">
              <Info className="w-10 h-10 text-[#B86B45] mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-[#252321]">No Grid Cell Selected</h3>
              <p className="text-xs text-[#6F6961] mt-1">
                Click any polygon on the GIS map to view localized downscaling drivers, temperature anomalies, and municipal action advisories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

