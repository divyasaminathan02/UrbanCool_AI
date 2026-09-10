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
  TrendingUp,
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
      // Auto-select first extreme/high risk zone if available
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
            <h1 className="text-2xl font-black text-[#12263A] tracking-tight">
              Urban Heat Intelligence
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#18B6A4]/15 text-[#0D8F82] border border-[#18B6A4]/30">
              Pune Municipal Region
            </span>
          </div>
          <p className="text-xs font-medium text-[#617080] mt-1">
            48-hour hyper-local heat risk outlook & municipal intervention command
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl text-xs font-bold text-[#172033] shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#18B6A4] ${isLoading ? 'animate-spin' : ''}`} />
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
            iconBg="bg-[#EF8069]/15"
            iconColor="text-[#C9543C]"
          />

          <MetricCard
            icon={AlertTriangle}
            label="High-Risk Zones"
            value={summary.kpis.high_risk_zones.count}
            subValue={`of ${summary.kpis.high_risk_zones.total} cells`}
            trend={summary.kpis.high_risk_zones.trend}
            trendType="danger"
            badge={
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D9534F]/15 text-[#D9534F]">
                &ge; 80 Risk
              </span>
            }
            iconBg="bg-[#D9534F]/15"
            iconColor="text-[#D9534F]"
          />

          <MetricCard
            icon={Users}
            label="Population Exposed"
            value={summary.kpis.population_exposed.count.toLocaleString()}
            subValue="citizens"
            trend={summary.kpis.population_exposed.trend}
            trendType="warning"
            iconBg="bg-[#F4B942]/15"
            iconColor="text-[#B88114]"
          />

          <MetricCard
            icon={Truck}
            label="Active Operations"
            value={summary.kpis.active_interventions.total}
            subValue={`${summary.kpis.active_interventions.awaiting_dispatch} awaiting dispatch`}
            trend={`${summary.kpis.active_interventions.in_progress} in active progress`}
            trendType="neutral"
            iconBg="bg-[#18B6A4]/15"
            iconColor="text-[#0D8F82]"
          />

          <MetricCard
            icon={CheckCircle2}
            label="Forecast Confidence"
            value={`${summary.kpis.forecast_confidence.percentage}%`}
            trend={summary.kpis.forecast_confidence.status}
            trendType="success"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-700"
          />
        </div>
      )}

      {/* Main Command Center: Map + Priority Zones Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Large GIS Map */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#18B6A4]" />
                  City Heat Risk Map (~250m Resolution)
                </h2>
                <p className="text-[11px] text-[#617080]">
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
            <div className="bg-white border border-[#DCE4E8] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#DCE4E8] pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#12263A] uppercase tracking-wider">
                    Priority Heat Zones
                  </h3>
                  <p className="text-[11px] text-[#617080]">Top high-risk micro-grids requiring action</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#D9534F] bg-[#D9534F]/10 px-2 py-0.5 rounded-md">
                  Top 6
                </span>
              </div>

              <div className="space-y-2.5">
                {summary?.priority_zones.map((pz) => (
                  <div
                    key={pz.zone_id}
                    onClick={() => handleSelectZoneFromList(pz)}
                    className="p-3 rounded-xl border border-[#DCE4E8] hover:border-[#18B6A4] hover:bg-[#F4F7F8] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-[#12263A] group-hover:text-[#0D8F82] transition-colors">
                          {pz.zone_name}
                        </div>
                        <div className="text-[10px] text-[#617080]">{pz.ward_name}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-[#D9534F]">
                          {pz.risk_score}
                        </span>
                        <div className="text-[9px] font-bold text-[#C9543C]">+{pz.temp_anomaly}°C</div>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] grid grid-cols-2 gap-1 text-[#617080]">
                      <div>
                        <span className="font-medium">Pop:</span> {pz.population_exposed.toLocaleString()}
                      </div>
                      <div className="truncate">
                        <span className="font-medium">Driver:</span> {pz.primary_driver}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#DCE4E8]/60 flex items-center justify-between text-[11px] text-[#0D8F82] font-semibold">
                      <span className="truncate">{pz.recommended_action}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Municipal Priority List */}
          {selectedFeature && summary && (
            <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-[#12263A] uppercase tracking-wider mb-2">
                Top Priority Zones List
              </h4>
              <div className="space-y-1.5">
                {summary.priority_zones.slice(0, 4).map((pz) => (
                  <button
                    key={pz.zone_id}
                    onClick={() => handleSelectZoneFromList(pz)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                      selectedFeature?.properties.zone_id === pz.zone_id
                        ? 'bg-[#18B6A4]/15 border-[#18B6A4] font-bold text-[#12263A]'
                        : 'bg-[#F4F7F8] border-[#DCE4E8] text-[#172033] hover:bg-[#EAEFF2]'
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{pz.zone_name}</span>
                    <span className="font-mono font-bold text-[#D9534F]">{pz.risk_score}</span>
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
            <h3 className="text-sm font-bold text-[#12263A] uppercase tracking-wider">
              Recommended Municipal Actions
            </h3>
            <button
              onClick={() => navigate('/recommendations')}
              className="text-xs font-bold text-[#0D8F82] hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="bg-white border border-[#DCE4E8] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#18B6A4]/15 text-[#0D8F82] flex items-center justify-center shrink-0">
                        <CardIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          card.priority === 'CRITICAL'
                            ? 'bg-[#D9534F]/15 text-[#D9534F]'
                            : card.priority === 'HIGH'
                            ? 'bg-[#EF8069]/15 text-[#C9543C]'
                            : 'bg-[#F4B942]/15 text-[#B88114]'
                        }`}
                      >
                        {card.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#12263A]">{card.category}</h4>
                    <p className="text-xs font-medium text-[#617080] mt-1">{card.zones_text}</p>
                    <p className="text-[11px] text-[#617080] mt-2 italic">{card.recommended_time}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (card.category.includes('Water')) navigate('/interventions');
                      else navigate('/recommendations');
                    }}
                    className="mt-3 w-full py-2 bg-[#F4F7F8] hover:bg-[#12263A] text-[#12263A] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
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
