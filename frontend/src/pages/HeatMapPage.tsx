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
          <h1 className="text-2xl font-black text-[#12263A] tracking-tight flex items-center gap-2">
            <span>Hyper-Local Heat Map GIS</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-[#18B6A4]/15 text-[#0D8F82] border border-[#18B6A4]/30 rounded-md">
              250m Downscaled
            </span>
          </h1>
          <p className="text-xs text-[#617080] mt-0.5">
            Multi-layer urban thermal canopy downscaling across Pune Municipal Corporation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-white border border-[#DCE4E8] rounded-xl font-medium text-[#172033]">
            <span className="text-[#617080]">Active Grid Cells:</span>{' '}
            <span className="font-bold text-[#12263A]">{geoData?.total_cells || 0}</span>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl font-bold text-[#617080] hover:text-[#172033] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Left Filters + Center Map + Right Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Filter Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-[#DCE4E8] rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE4E8] pb-2.5">
            <span className="text-xs font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#18B6A4]" />
              GIS Layer Filters
            </span>
          </div>

          {/* Forecast Horizon */}
          <div>
            <label className="block text-[11px] font-bold text-[#617080] uppercase tracking-wider mb-1.5">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setHorizon(24)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  horizon === 24
                    ? 'bg-[#12263A] text-white border-[#12263A]'
                    : 'bg-[#F4F7F8] text-[#617080] border-[#DCE4E8] hover:bg-[#EAEFF2]'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setHorizon(48)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  horizon === 48
                    ? 'bg-[#12263A] text-white border-[#12263A]'
                    : 'bg-[#F4F7F8] text-[#617080] border-[#DCE4E8] hover:bg-[#EAEFF2]'
                }`}
              >
                48 Hours
              </button>
            </div>
          </div>

          {/* Risk Severity Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#617080] uppercase tracking-wider mb-1.5">
              Heat Risk Severity
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Risk Levels' },
                { id: 'high_plus', label: 'High+ (&ge; 60)' },
                { id: 'very_high_plus', label: 'Very High+ (&ge; 80)' },
                { id: 'extreme', label: 'Extreme Only (&ge; 90)' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRiskFilter(rf.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    riskFilter === rf.id
                      ? 'bg-[#18B6A4]/15 border-[#18B6A4] text-[#12263A] font-bold'
                      : 'bg-[#F4F7F8] border-[#DCE4E8] text-[#617080] hover:bg-[#EAEFF2]'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Population Exposure Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#617080] uppercase tracking-wider mb-1.5">
              Population Exposure
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setPopFilter('all')}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  popFilter === 'all'
                    ? 'bg-[#18B6A4]/15 border-[#18B6A4] text-[#12263A] font-bold'
                    : 'bg-[#F4F7F8] border-[#DCE4E8] text-[#617080] hover:bg-[#EAEFF2]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPopFilter('high_exposure')}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  popFilter === 'high_exposure'
                    ? 'bg-[#18B6A4]/15 border-[#18B6A4] text-[#12263A] font-bold'
                    : 'bg-[#F4F7F8] border-[#DCE4E8] text-[#617080] hover:bg-[#EAEFF2]'
                }`}
              >
                High (&ge; 20k)
              </button>
            </div>
          </div>

          {/* Vegetation / NDVI Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#617080] uppercase tracking-wider mb-1.5">
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
                      ? 'bg-[#18B6A4]/15 border-[#18B6A4] text-[#12263A] font-bold'
                      : 'bg-[#F4F7F8] border-[#DCE4E8] text-[#617080] hover:bg-[#EAEFF2]'
                  }`}
                >
                  {nf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Overlay Layer Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-[#617080] uppercase tracking-wider mb-1.5">
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
                        ? 'bg-[#12263A] text-white border-[#12263A] font-bold'
                        : 'bg-[#F4F7F8] border-[#DCE4E8] text-[#617080] hover:bg-[#EAEFF2]'
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

        {/* Center GIS Map (6 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#DCE4E8] rounded-2xl p-3 shadow-xs">
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
            <div className="bg-white border border-[#DCE4E8] rounded-2xl p-8 text-center text-[#617080] shadow-xs">
              <Info className="w-10 h-10 text-[#18B6A4] mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-[#12263A]">No Grid Cell Selected</h3>
              <p className="text-xs text-[#617080] mt-1">
                Click any polygon on the GIS map to view localized downscaling drivers, temperature anomalies, and municipal action advisories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
