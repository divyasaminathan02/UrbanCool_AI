import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  DashboardSummary,
  GeoJSONCollection,
  GeoJSONFeature,
  PriorityZone,
} from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { OfficerBanner } from '../components/common/OfficerBanner';
import { HeatMapLeaflet, MapLayerType } from '../components/map/HeatMapLeaflet';
import { ZoneIntelligencePanel } from '../components/zones/ZoneIntelligencePanel';
import {
  Flame,
  AlertTriangle,
  Users,
  Truck,
  CheckCircle2,
  Droplets,
  Building,
  BellRing,
  TreePine,
  ArrowRight,
  RefreshCw,
  Layers,
  HeartPulse,
  Sliders,
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { scenario } = useScenario();
  const { role, officerInfo } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>(officerInfo.defaultMapLayer);
  const [horizon, setHorizon] = useState<number>(24);
  const [isLoading, setIsLoading] = useState(true);

  // Sync activeLayer when officer role changes
  useEffect(() => {
    setActiveLayer(officerInfo.defaultMapLayer);
  }, [role, officerInfo]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, mapRes] = await Promise.all([
        apiService.getDashboard(scenario),
        apiService.getHeatmap(scenario, horizon),
      ]);
      setSummary(sumRes);
      setGeoData(mapRes);
      if (mapRes.features.length > 0 && !selectedFeature) {
        const topHigh = mapRes.features.find((f) => f.properties.risk_score >= 80) || mapRes.features[0];
        setSelectedFeature(topHigh);
      }
    } catch (e) {
      console.error('Error fetching dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [scenario, horizon]);

  const handleSelectZoneFromList = (pz: PriorityZone) => {
    if (geoData) {
      const match = geoData.features.find((f) => f.properties.zone_id === pz.zone_id);
      if (match) setSelectedFeature(match);
    }
  };

  const handleDispatchTanker = async (zoneId: string, zoneName: string) => {
    try {
      await apiService.createIntervention({
        zone_id: zoneId,
        title: `Water Tanker Fleet — ${zoneName}`,
        intervention_type: 'Water Tanker',
        priority: 'CRITICAL',
        target_location: zoneName,
        reason: `Emergency dispatch from Dashboard for extreme risk zone ${zoneId}`,
        suggested_dispatch: '2 Tankers (10,000L)',
        assigned_department: 'Water Supply & Emergency Services',
        scenario: scenario,
      });
      navigate('/interventions');
    } catch {
      navigate('/interventions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Persona Command HUD */}
      <OfficerBanner />

      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#252321] tracking-tight">
              Urban Heat Intelligence Command
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C59A4A]/15 text-[#8E6A26] border border-[#C59A4A]/30">
              Pune Municipal Region
            </span>
          </div>
          <p className="text-xs font-medium text-[#6F6961] mt-1">
            48-hour hyper-local heat risk outlook & municipal intervention command tailored for <span className="font-bold text-[#252321]">{officerInfo.fullName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FBF9F4] hover:bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs font-bold text-[#252321] shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B86B45] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Sync</span>
          </button>
        </div>
      </div>

      {/* Dynamic Officer-Tailored 5 KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {role === 'WATER_OFFICER' ? (
            <>
              <MetricCard
                icon={Droplets}
                label="Water Fleet Operations"
                value="160,000 L"
                subValue="Dispatched across city"
                trend="16 active operations"
                trendType="success"
                badge={<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4B88A2]/15 text-[#4B88A2]">Logistics Active</span>}
                iconBg="bg-[#4B88A2]/15"
                iconColor="text-[#4B88A2]"
              />
              <MetricCard
                icon={Truck}
                label="Active Tankers & Misting"
                value={summary.kpis.active_interventions.total}
                subValue={`${summary.kpis.active_interventions.awaiting_dispatch} awaiting dispatch`}
                trend="8 misting cannons deployed"
                trendType="neutral"
                iconBg="bg-[#4B88A2]/15"
                iconColor="text-[#4B88A2]"
              />
              <MetricCard
                icon={Flame}
                label="Peak LST Hotspots"
                value="43.8°C"
                subValue="Shivajinagar & Hadapsar"
                trend="+4.8°C surface anomaly"
                trendType="danger"
                iconBg="bg-[#C9674B]/15"
                iconColor="text-[#A0462C]"
              />
              <MetricCard
                icon={ShieldCheck}
                label="Water Buffer Reserve"
                value="680,000 L"
                subValue="Pumping stations online"
                trend="100% capacity"
                trendType="success"
                iconBg="bg-[#8E9274]/15"
                iconColor="text-[#4E523A]"
              />
              <MetricCard
                icon={Sparkles}
                label="Thermal Relief Delta"
                value="-2.4°C"
                subValue="In 250m mist buffer"
                trend="Verified downscaling"
                trendType="success"
                iconBg="bg-[#8E9274]/15"
                iconColor="text-[#4E523A]"
              />
            </>
          ) : role === 'PLANNER' ? (
            <>
              <MetricCard
                icon={TreePine}
                label="Canopy Deficit Wards"
                value="18 Wards"
                subValue="NDVI < 0.15 threshold"
                trend="Acute shade deficit"
                trendType="danger"
                badge={<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8E9274]/15 text-[#4E523A]">Zoning Target</span>}
                iconBg="bg-[#8E9274]/15"
                iconColor="text-[#4E523A]"
              />
              <MetricCard
                icon={Building}
                label="High Built-Up Traps"
                value="92%"
                subValue="Core commercial density"
                trend="Mandai & Shivajinagar"
                trendType="danger"
                iconBg="bg-[#9F4937]/15"
                iconColor="text-[#9F4937]"
              />
              <MetricCard
                icon={Sparkles}
                label="Cool Roof Candidates"
                value="24 Sites"
                subValue="High-albedo retrofit"
                trend="12 scheduled for Q3"
                trendType="success"
                iconBg="bg-[#C59A4A]/15"
                iconColor="text-[#8E6A26]"
              />
              <MetricCard
                icon={Layers}
                label="City Mean NDVI"
                value="0.14"
                subValue="Target: 0.28 by 2030"
                trend="-0.02 vs rural baseline"
                trendType="warning"
                iconBg="bg-[#8E9274]/15"
                iconColor="text-[#4E523A]"
              />
              <MetricCard
                icon={CheckCircle2}
                label="GIS Model Confidence"
                value={`${summary.kpis.forecast_confidence.percentage}%`}
                trend="Sentinel-2 verified"
                trendType="success"
                iconBg="bg-[#8E9274]/15"
                iconColor="text-[#4E523A]"
              />
            </>
          ) : role === 'PUBLIC_HEALTH' ? (
            <>
              <MetricCard
                icon={Users}
                label="Vulnerable Citizens"
                value={summary.kpis.population_exposed.count.toLocaleString()}
                subValue="Elderly & pediatric"
                trend={summary.kpis.population_exposed.trend}
                trendType="danger"
                badge={<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#9F4937]/15 text-[#9F4937]">High Priority</span>}
                iconBg="bg-[#9F4937]/15"
                iconColor="text-[#9F4937]"
              />
              <MetricCard
                icon={Building}
                label="AC Cooling Shelters"
                value="18 Activated"
                subValue="Community halls & centers"
                trend="24/7 chilled hydration"
                trendType="success"
                iconBg="bg-[#8E9274]/15"
                iconColor="text-[#4E523A]"
              />
              <MetricCard
                icon={HeartPulse}
                label="Hospital Surge Beds"
                value="120 Reserved"
                subValue="Sassoon & Civil wards"
                trend="Cold-saline kits ready"
                trendType="neutral"
                iconBg="bg-[#9F4937]/15"
                iconColor="text-[#9F4937]"
              />
              <MetricCard
                icon={Flame}
                label="Extreme Heat Index"
                value="44.5°C"
                subValue="Steadman index peak"
                trend="Heat exhaustion risk"
                trendType="danger"
                iconBg="bg-[#C9674B]/15"
                iconColor="text-[#A0462C]"
              />
              <MetricCard
                icon={BellRing}
                label="Health Broadcasts"
                value="100% Active"
                subValue="SMS & clinic networks"
                trend="Moratorium advisory live"
                trendType="success"
                iconBg="bg-[#B86B45]/15"
                iconColor="text-[#B86B45]"
              />
            </>
          ) : (
            <>
              <MetricCard
                icon={Flame}
                label="City Heat Risk"
                value={`${summary.kpis.city_heat_risk.score}`}
                subValue="/ 100"
                trend={summary.kpis.city_heat_risk.trend}
                trendType={summary.kpis.city_heat_risk.score >= 70 ? 'danger' : 'warning'}
                badge={<RiskBadge score={summary.kpis.city_heat_risk.score} size="sm" showScore={false} />}
                iconBg="bg-[#C9674B]/15"
                iconColor="text-[#A0462C]"
              />
              <MetricCard
                icon={AlertTriangle}
                label="High-Risk Zones"
                value={summary.kpis.high_risk_zones.count}
                subValue={`of ${summary.kpis.high_risk_zones.total} cells`}
                trend={summary.kpis.high_risk_zones.trend}
                trendType="danger"
                badge={
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#9F4937]/15 text-[#9F4937]">
                    &ge; 80 Risk
                  </span>
                }
                iconBg="bg-[#9F4937]/15"
                iconColor="text-[#9F4937]"
              />
              <MetricCard
                icon={Users}
                label="Population Exposed"
                value={summary.kpis.population_exposed.count.toLocaleString()}
                subValue="citizens"
                trend={summary.kpis.population_exposed.trend}
                trendType="warning"
                iconBg="bg-[#C59A4A]/15"
                iconColor="text-[#8E6A26]"
              />
              <MetricCard
                icon={Truck}
                label="Active Operations"
                value={summary.kpis.active_interventions.total}
                subValue={`${summary.kpis.active_interventions.awaiting_dispatch} awaiting dispatch`}
                trend={`${summary.kpis.active_interventions.in_progress} in active progress`}
                trendType="neutral"
                iconBg="bg-[#B86B45]/15"
                iconColor="text-[#B86B45]"
              />
              <MetricCard
                icon={CheckCircle2}
                label="Forecast Confidence"
                value={`${summary.kpis.forecast_confidence.percentage}%`}
                trend={summary.kpis.forecast_confidence.status}
                trendType="success"
                iconBg="bg-[#8E9274]/15"
                iconColor="text-[#5F6348]"
              />
            </>
          )}
        </div>
      )}

      {/* Main Command Center: Map + Priority Zones Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Large GIS Map */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#252321] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B86B45]" />
                  City Heat Risk Map (~250m Resolution)
                </h2>
                <p className="text-[11px] text-[#6F6961]">
                  Active layer: <span className="font-bold text-[#252321] uppercase">{activeLayer}</span> • Configured for {officerInfo.department}
                </p>
              </div>
            </div>

            {geoData && (
              <HeatMapLeaflet
                features={geoData.features}
                selectedZoneId={selectedFeature?.properties.zone_id}
                onSelectZone={(f) => setSelectedFeature(f)}
                height="560px"
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                horizon={horizon}
                onHorizonChange={setHorizon}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar: Selected Zone Intelligence or Priority Zones */}
        <div className="lg:col-span-4 space-y-4">
          {selectedFeature ? (
            <ZoneIntelligencePanel
              feature={selectedFeature}
              onClose={() => setSelectedFeature(null)}
              onDispatchTanker={handleDispatchTanker}
            />
          ) : (
            <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E7DED0] pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#252321] uppercase tracking-wider">
                    Priority Heat Zones
                  </h3>
                  <p className="text-[11px] text-[#6F6961]">Top high-risk micro-grids requiring action</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#9F4937] bg-[#9F4937]/10 px-2 py-0.5 rounded-md">
                  Top 6
                </span>
              </div>

              <div className="space-y-2.5">
                {summary?.priority_zones.map((pz) => (
                  <div
                    key={pz.zone_id}
                    onClick={() => handleSelectZoneFromList(pz)}
                    className="p-3 rounded-xl border border-[#E7DED0] hover:border-[#B86B45] hover:bg-[#F5F1E8] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-[#252321] group-hover:text-[#B86B45] transition-colors">
                          {pz.zone_name}
                        </div>
                        <div className="text-[10px] text-[#6F6961]">
                          {pz.ward_name} • {pz.population_exposed.toLocaleString()} citizens
                        </div>
                      </div>
                      <RiskBadge score={pz.risk_score} size="sm" />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-[#E7DED0]/60 pt-2 text-[#6F6961]">
                      <span className="font-mono font-medium">
                        {pz.predicted_temp}°C <span className="text-[#9F4937] font-bold">({pz.temp_anomaly >= 0 ? `+${pz.temp_anomaly}` : pz.temp_anomaly}°C)</span>
                      </span>
                      <span className="text-[10px] text-[#B86B45] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categorized Municipal Action Cards */}
      {summary && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#252321] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B86B45]" />
              Municipal Action Dispatch Pipeline
            </h2>
            <button
              onClick={() => navigate('/recommendations')}
              className="text-xs font-bold text-[#B86B45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All 44 Advisories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.action_cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-[#FBF9F4] border border-[#E7DED0] hover:border-[#B86B45] rounded-2xl p-4 shadow-2xs flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] rounded-md uppercase tracking-wider">
                      {card.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        card.priority === 'CRITICAL'
                          ? 'bg-[#9F4937]/15 text-[#9F4937]'
                          : card.priority === 'HIGH'
                          ? 'bg-[#C9674B]/15 text-[#C9674B]'
                          : 'bg-[#C59A4A]/15 text-[#8E6A26]'
                      }`}
                    >
                      {card.priority}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-[#252321] line-clamp-2 mb-1 group-hover:text-[#B86B45] transition-colors">
                    {card.action}
                  </h3>

                  <p className="text-[11px] text-[#6F6961] mb-3">
                    Target: <span className="font-medium text-[#252321]">{card.zones_text}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E7DED0] flex items-center justify-between text-[11px]">
                  <span className="text-[#6F6961] text-[10px]">{card.recommended_time}</span>
                  <button
                    onClick={() => navigate('/recommendations')}
                    className="font-bold text-[#B86B45] hover:underline flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <span>Dispatch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
