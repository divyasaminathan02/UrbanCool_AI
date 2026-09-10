import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  History,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export const ZoneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { scenario } = useScenario();

  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const loadZoneDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiService.getZoneDetails(id, scenario);
      setData(res);
    } catch (e) {
      console.error('Failed to load zone details', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadZoneDetails();
  }, [id, scenario]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-[#B86B45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#6F6961]">Loading microclimate telemetry...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#FBF9F4] p-8 rounded-2xl border border-[#E7DED0] text-center">
        <p className="text-sm font-bold text-[#252321]">Zone not found.</p>
        <button
          onClick={() => navigate('/zones')}
          className="mt-4 px-4 py-2 bg-[#B86B45] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#925238] transition-colors"
        >
          Back to Zones Directory
        </button>
      </div>
    );
  }

  const { zone, prediction, hourly_forecast, feature_contributions, historical_events, recommendations } = data;

  const handleQuickDispatch = async () => {
    try {
      await apiService.createIntervention({
        zone_id: zone.id,
        title: `Water Tanker Fleet — ${zone.zone_name}`,
        intervention_type: 'Water Tanker',
        priority: prediction.risk_score >= 85 ? 'CRITICAL' : 'HIGH',
        target_location: zone.zone_name,
        reason: `Triggered from Zone Detail Intelligence for Risk ${prediction.risk_score}`,
        suggested_dispatch: '2 Municipal Tankers (10,000L)',
        assigned_department: 'Water Supply & Emergency Services',
        scenario: scenario,
      });
      setDispatchSuccess('Water Tanker Dispatched successfully!');
      setTimeout(() => {
        setDispatchSuccess(null);
        navigate('/interventions');
      }, 1200);
    } catch (e) {
      navigate('/interventions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[#FBF9F4] hover:bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-[#252321] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#252321] text-[#F5F1E8]">
                {zone.id}
              </span>
              <RiskBadge score={prediction.risk_score} category={prediction.risk_category} size="md" />
              <span className="text-xs font-bold text-[#6F6961]">{zone.ward_name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight mt-1">
              {zone.zone_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickDispatch}
            className="px-4 py-2 bg-[#B86B45] hover:bg-[#925238] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 text-[#F5F1E8]" />
            <span>Dispatch Water Tanker</span>
          </button>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-3 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321] flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8E9274]" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Heat Risk Score</span>
          <div className="text-2xl font-black font-mono text-[#252321] mt-1">{prediction.risk_score}</div>
          <span className="text-[10px] text-[#6F6961]">out of 100</span>
        </div>

        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Microclimate Peak</span>
          <div className="text-2xl font-black font-mono text-[#9F4937] mt-1">{prediction.predicted_temp}°C</div>
          <span className="text-[10px] text-[#C9674B] font-bold">+{prediction.temp_anomaly}°C vs City</span>
        </div>

        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Surface LST</span>
          <div className="text-2xl font-black font-mono text-[#252321] mt-1">{prediction.lst_celsius}°C</div>
          <span className="text-[10px] text-[#6F6961]">MODIS / Landsat</span>
        </div>

        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">NDVI Canopy</span>
          <div className="text-2xl font-black font-mono text-[#8E9274] mt-1">{zone.baseline_ndvi.toFixed(2)}</div>
          <span className="text-[10px] text-[#6F6961]">Sentinel-2 ESA</span>
        </div>

        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Population</span>
          <div className="text-2xl font-black font-mono text-[#252321] mt-1">{zone.population.toLocaleString()}</div>
          <span className="text-[10px] text-[#C59A4A] font-medium">{zone.vulnerable_population.toLocaleString()} vulnerable</span>
        </div>

        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Elevation / DEM</span>
          <div className="text-2xl font-black font-mono text-[#252321] mt-1">{zone.elevation_m}m</div>
          <span className="text-[10px] text-[#6F6961]">SRTM 30m</span>
        </div>
      </div>

      {/* 2-Column Main Section: Charts + Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 24-Hour Diurnal Temperature Curve (8 cols) */}
        <div className="lg:col-span-8 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#B86B45]" />
                24-Hour Microclimate Temperature & Risk Forecast
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[#B86B45]">
                  <span className="w-3 h-0.5 bg-[#B86B45] rounded-full inline-block" />
                  UrbanCool Localized
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#6F6961]">
                  <span className="w-3 h-0.5 bg-[#6F6961] rounded-full inline-block" />
                  Official IMD Forecast
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#6F6961] mt-1">
              Diurnal solar radiation response downscaled for surface thermal inertia and urban canopy cover
            </p>

            {/* Recharts Diurnal Temperature Curve */}
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourly_forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7DED0" />
                  <XAxis dataKey="hour" stroke="#6F6961" tick={{ fontSize: 10 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#6F6961" tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#252321] text-[#F5F1E8] p-2.5 rounded-xl text-xs shadow-lg font-mono">
                            <div className="font-bold text-[#C59A4A] mb-1">{label}</div>
                            <div>Localized: <b className="text-[#C9674B]">{payload[0]?.value}°C</b></div>
                            <div>Official: <span className="text-[#E7DED0]">{payload[1]?.value}°C</span></div>
                            <div className="border-t border-[#6F6961]/40 mt-1 pt-1 text-[11px]">
                              Risk Index: <b>{payload[0]?.payload.risk_score} / 100</b>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="predicted_temp" stroke="#B86B45" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="official_temp" stroke="#6F6961" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Heat Events Comparison */}
          <div className="border-t border-[#E7DED0] pt-5">
            <h4 className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <History className="w-3.5 h-3.5 text-[#B86B45]" />
              Multi-Year Thermal Stress Comparison (Pune Benchmark)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {historical_events.map((ev: any) => (
                <div key={ev.year} className="p-3 bg-[#F5F1E8] rounded-xl border border-[#E7DED0] text-xs">
                  <div className="font-bold text-[#252321]">{ev.year}</div>
                  <div className="mt-1 font-mono text-sm font-extrabold text-[#9F4937]">{ev.zone_peak}°C</div>
                  <div className="text-[10px] text-[#6F6961] mt-0.5">{ev.days_above_40} days &gt; 40°C</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Explainable AI Driver Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#B86B45]" />
                  Model Feature Contribution
                </h3>
              </div>
              <p className="text-[11px] text-[#6F6961] mt-1">
                Decomposition of physical factors elevating risk in this micro-grid
              </p>
            </div>

            <div className="space-y-3">
              {feature_contributions.map((fc: any) => (
                <div key={fc.feature}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#252321] font-medium">{fc.feature}</span>
                    <span className="font-mono font-bold text-[#252321]">{fc.importance}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#E7DED0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        fc.importance >= 80 ? 'bg-[#9F4937]' : fc.importance >= 60 ? 'bg-[#C9674B]' : 'bg-[#B86B45]'
                      }`}
                      style={{ width: `${fc.importance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Explainable AI Narrative */}
            <div className="p-3.5 rounded-xl bg-[#F5F1E8] border border-[#E7DED0]">
              <span className="text-xs font-bold text-[#B86B45] block mb-1">Explainable AI Intelligence</span>
              <p className="text-xs text-[#252321] leading-relaxed">
                {prediction.explainable_summary}
              </p>
            </div>
          </div>

          {/* Active Advisories Card */}
          <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#252321] uppercase tracking-wider mb-2">
              Zone Action Advisories ({recommendations?.length || 0})
            </h4>
            <div className="space-y-2">
              {recommendations?.map((r: any) => (
                <div key={r.id} className="p-2.5 bg-[#F5F1E8] rounded-xl border border-[#E7DED0] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#252321]">{r.category}</span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#6F6961] line-clamp-2">{r.action_title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

