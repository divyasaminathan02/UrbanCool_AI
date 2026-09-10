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
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import {
  ArrowLeft,
  Thermometer,
  Flame,
  TreePine,
  Users,
  Building,
  Droplets,
  AlertTriangle,
  History,
  TrendingUp,
  MapPin,
  Mountain,
  ShieldCheck,
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
          <div className="w-8 h-8 border-3 border-[#18B6A4] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#617080]">Loading microclimate telemetry...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#DCE4E8] text-center">
        <p className="text-sm font-bold text-[#12263A]">Zone not found.</p>
        <button
          onClick={() => navigate('/zones')}
          className="mt-4 px-4 py-2 bg-[#12263A] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Back to Zones Directory
        </button>
      </div>
    );
  }

  const { zone, prediction, hourly_forecast, feature_contributions, historical_events, recommendations, interventions } = data;

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
            className="p-2 bg-white hover:bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl text-[#12263A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#12263A] text-white">
                {zone.id}
              </span>
              <RiskBadge score={prediction.risk_score} category={prediction.risk_category} size="md" />
              <span className="text-xs font-bold text-[#617080]">{zone.ward_name}</span>
            </div>
            <h1 className="text-2xl font-black text-[#12263A] tracking-tight mt-1">
              {zone.zone_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickDispatch}
            className="px-4 py-2 bg-[#12263A] hover:bg-[#1B344D] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#12263A]/20 flex items-center gap-2 cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 text-[#18B6A4]" />
            <span>Dispatch Water Tanker</span>
          </button>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">Heat Risk Score</span>
          <div className="text-2xl font-black font-mono text-[#12263A] mt-1">{prediction.risk_score}</div>
          <span className="text-[10px] text-[#617080]">out of 100</span>
        </div>

        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">Microclimate Peak</span>
          <div className="text-2xl font-black font-mono text-[#D9534F] mt-1">{prediction.predicted_temp}°C</div>
          <span className="text-[10px] text-[#C9543C] font-bold">+{prediction.temp_anomaly}°C vs City</span>
        </div>

        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">Surface LST</span>
          <div className="text-2xl font-black font-mono text-[#172033] mt-1">{prediction.lst_celsius}°C</div>
          <span className="text-[10px] text-[#617080]">MODIS / Landsat</span>
        </div>

        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">NDVI Canopy</span>
          <div className="text-2xl font-black font-mono text-[#0D8F82] mt-1">{zone.baseline_ndvi.toFixed(2)}</div>
          <span className="text-[10px] text-[#617080]">Sentinel-2 ESA</span>
        </div>

        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">Population</span>
          <div className="text-2xl font-black font-mono text-[#172033] mt-1">{zone.population.toLocaleString()}</div>
          <span className="text-[10px] text-[#B88114] font-medium">{zone.vulnerable_population.toLocaleString()} vulnerable</span>
        </div>

        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">Elevation / DEM</span>
          <div className="text-2xl font-black font-mono text-[#172033] mt-1">{zone.elevation_m}m</div>
          <span className="text-[10px] text-[#617080]">SRTM 30m</span>
        </div>
      </div>

      {/* 2-Column Main Section: Charts + Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 24-Hour Diurnal Temperature Curve (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#DCE4E8] rounded-2xl p-5 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#D9534F]" />
                24-Hour Microclimate Temperature & Risk Forecast
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[#D9534F]">
                  <span className="w-3 h-0.5 bg-[#D9534F] rounded-full inline-block" />
                  UrbanCool Localized
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#617080]">
                  <span className="w-3 h-0.5 bg-[#9AAEB9] rounded-full inline-block" />
                  Official IMD Forecast
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#617080] mt-1">
              Diurnal solar radiation response downscaled for surface thermal inertia and urban canopy cover
            </p>

            {/* Recharts Diurnal Temperature Curve */}
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourly_forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F6" />
                  <XAxis dataKey="hour" stroke="#9AAEB9" tick={{ fontSize: 10 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#9AAEB9" tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#12263A] text-white p-2.5 rounded-xl text-xs shadow-lg font-mono">
                            <div className="font-bold text-[#18B6A4] mb-1">{label}</div>
                            <div>Localized: <b className="text-[#EF8069]">{payload[0]?.value}°C</b></div>
                            <div>Official: <span className="text-[#9AAEB9]">{payload[1]?.value}°C</span></div>
                            <div className="border-t border-[#1B344D] mt-1 pt-1 text-[11px]">
                              Risk Index: <b>{payload[0]?.payload.risk_score} / 100</b>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="predicted_temp" stroke="#D9534F" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="official_temp" stroke="#9AAEB9" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Heat Events Comparison */}
          <div className="border-t border-[#DCE4E8] pt-5">
            <h4 className="text-xs font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <History className="w-3.5 h-3.5 text-[#18B6A4]" />
              Multi-Year Thermal Stress Comparison (Pune Benchmark)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {historical_events.map((ev: any) => (
                <div key={ev.year} className="p-3 bg-[#F4F7F8] rounded-xl border border-[#DCE4E8] text-xs">
                  <div className="font-bold text-[#12263A]">{ev.year}</div>
                  <div className="mt-1 font-mono text-sm font-extrabold text-[#D9534F]">{ev.zone_peak}°C</div>
                  <div className="text-[10px] text-[#617080] mt-0.5">{ev.days_above_40} days &gt; 40°C</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Explainable AI Driver Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#DCE4E8] rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#18B6A4]" />
                  Model Feature Contribution Estimate
                </h3>
              </div>
              <p className="text-[11px] text-[#617080] mt-1">
                Decomposition of physical factors elevating risk in this micro-grid
              </p>
            </div>

            <div className="space-y-3">
              {feature_contributions.map((fc: any) => (
                <div key={fc.feature}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#172033] font-medium">{fc.feature}</span>
                    <span className="font-mono font-bold text-[#12263A]">{fc.importance}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5ECF0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        fc.importance >= 80 ? 'bg-[#D9534F]' : fc.importance >= 60 ? 'bg-[#EF8069]' : 'bg-[#18B6A4]'
                      }`}
                      style={{ width: `${fc.importance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Explainable AI Narrative */}
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200">
              <span className="text-xs font-bold text-[#0D8F82] block mb-1">Explainable AI Intelligence</span>
              <p className="text-xs text-[#172033] leading-relaxed">
                {prediction.explainable_summary}
              </p>
            </div>
          </div>

          {/* Active Advisories Card */}
          <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#12263A] uppercase tracking-wider mb-2">
              Zone Action Advisories ({recommendations?.length || 0})
            </h4>
            <div className="space-y-2">
              {recommendations?.map((r: any) => (
                <div key={r.id} className="p-2.5 bg-[#F4F7F8] rounded-xl border border-[#DCE4E8] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#12263A]">{r.category}</span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#617080] line-clamp-2">{r.action_title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
