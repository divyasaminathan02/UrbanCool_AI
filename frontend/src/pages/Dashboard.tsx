import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import {
  DashboardSummary,
  GeoJSONCollection,
  GeoJSONFeature,
  PriorityZone,
} from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
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
  Layers
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { scenario } = useScenario();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('risk');
  const [horizon, setHorizon] = useState<number>(24);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (e) {
      navigate('/interventions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
            48-hour hyper-local heat risk outlook & municipal intervention command
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

      {/* Top 5 KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  Click any microclimate grid cell to inspect localized downscaling drivers and anomalies
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
                        <div className="text-[10px] text-[#6F6961]">{pz.ward_name}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-[#9F4937]">
                          {pz.risk_score}
                        </span>
                        <div className="text-[9px] font-bold text-[#C9674B]">+{pz.temp_anomaly}°C</div>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] grid grid-cols-2 gap-1 text-[#6F6961]">
                      <div>
                        <span className="font-medium">Pop:</span> {pz.population_exposed.toLocaleString()}
                      </div>
                      <div className="truncate">
                        <span className="font-medium">Driver:</span> {pz.primary_driver}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E7DED0]/70 flex items-center justify-between text-[11px] text-[#B86B45] font-semibold">
                      <span className="truncate">{pz.recommended_action}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Priority List when item selected */}
          {selectedFeature && summary && (
            <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-2xs">
              <h4 className="text-xs font-bold text-[#252321] uppercase tracking-wider mb-2">
                Top Priority Zones List
              </h4>
              <div className="space-y-1.5">
                {summary.priority_zones.slice(0, 4).map((pz) => (
                  <button
                    key={pz.zone_id}
                    onClick={() => handleSelectZoneFromList(pz)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                      selectedFeature?.properties.zone_id === pz.zone_id
                        ? 'bg-[#B86B45]/15 border-[#B86B45] font-bold text-[#252321]'
                        : 'bg-[#F5F1E8] border-[#E7DED0] text-[#252321] hover:bg-[#EAE2D5]'
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{pz.zone_name}</span>
                    <span className="font-mono font-bold text-[#9F4937]">{pz.risk_score}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recommended Actions Cards */}
      {summary && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#252321] uppercase tracking-wider">
              Recommended Municipal Actions
            </h3>
            <button
              onClick={() => navigate('/recommendations')}
              className="text-xs font-bold text-[#B86B45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Action Advisories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.action_cards.map((card, idx) => {
              const icons = [Droplets, Building, BellRing, TreePine];
              const CardIcon = icons[idx % icons.length];

              return (
                <div
                  key={card.category}
                  className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#B86B45]/15 text-[#B86B45] flex items-center justify-center shrink-0">
                        <CardIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          card.priority === 'CRITICAL'
                            ? 'bg-[#9F4937]/15 text-[#9F4937]'
                            : card.priority === 'HIGH'
                            ? 'bg-[#C9674B]/15 text-[#A0462C]'
                            : 'bg-[#C59A4A]/15 text-[#8E6A26]'
                        }`}
                      >
                        {card.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#252321]">{card.category}</h4>
                    <p className="text-xs font-medium text-[#6F6961] mt-1">{card.zones_text}</p>
                    <p className="text-[11px] text-[#6F6961] mt-2 italic">{card.recommended_time}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (card.category.includes('Water')) navigate('/interventions');
                      else navigate('/recommendations');
                    }}
                    className="mt-3 w-full py-2 bg-[#F5F1E8] hover:bg-[#B86B45] text-[#252321] hover:text-[#FBF9F4] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{card.action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
