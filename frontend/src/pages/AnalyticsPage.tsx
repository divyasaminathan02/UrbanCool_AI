import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { AnalyticsData } from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { scenario } = useScenario();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.getAnalytics(scenario);
        setData(res);
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, [scenario]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-[#B86B45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#6F6961]">Loading climate analytics...</p>
        </div>
      </div>
    );
  }

  const { model_performance, ward_risk, ndvi_vs_risk, heat_trend, response_times } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              Climate Analytics & Model Performance
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              Empirical ML
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Empirical evaluation, spatial vulnerability correlations, and municipal operational metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-[#FBF9F4] border border-[#E7DED0] text-[#A98245] rounded-xl flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59A4A]" />
            <span>Dataset Validation Benchmark</span>
          </span>
        </div>
      </div>

      {/* Model Performance Top Card (Transparent & Honest) */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7DED0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#B86B45]/10 rounded-lg text-[#B86B45]">
                <Cpu className="w-4 h-4" />
              </span>
              <h2 className="text-base font-extrabold text-[#252321]">
                AI Downscaling Model Architecture & Metrics
              </h2>
            </div>
            <p className="text-xs text-[#6F6961] mt-0.5">
              {model_performance.model_architecture}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs text-[#6F6961]">
            <Info className="w-3.5 h-3.5 text-[#B86B45]" />
            <span>{model_performance.validation_note}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F5F1E8] rounded-2xl border border-[#E7DED0] text-center">
            <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Mean Absolute Error (MAE)</span>
            <span className="text-3xl font-black font-mono text-[#8E9274] mt-1 block">{model_performance.mae}°C</span>
            <span className="text-[10px] text-[#6F6961]">Localized ΔT accuracy</span>
          </div>

          <div className="p-4 bg-[#F5F1E8] rounded-2xl border border-[#E7DED0] text-center">
            <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Root Mean Squared Error</span>
            <span className="text-3xl font-black font-mono text-[#252321] mt-1 block">{model_performance.rmse}°C</span>
            <span className="text-[10px] text-[#6F6961]">Thermal deviation proxy</span>
          </div>

          <div className="p-4 bg-[#F5F1E8] rounded-2xl border border-[#E7DED0] text-center">
            <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Coefficient of Determination</span>
            <span className="text-3xl font-black font-mono text-[#B86B45] mt-1 block">R² = {model_performance.r2}</span>
            <span className="text-[10px] text-[#6F6961]">{model_performance.features_used} physical features</span>
          </div>

          <div className="p-4 bg-[#F5F1E8] rounded-2xl border border-[#E7DED0] text-center">
            <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">Forecast Confidence</span>
            <span className="text-3xl font-black font-mono text-[#C9674B] mt-1 block">{model_performance.forecast_confidence}</span>
            <span className="text-[10px] text-[#6F6961]">{model_performance.dataset_samples} calibration samples</span>
          </div>
        </div>
      </div>

      {/* Row 1: Heat Trend & Response Times */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-Day Heat Trend (7 cols) */}
        <div className="lg:col-span-7 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#252321] uppercase tracking-wider mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#B86B45]" />
            Multi-Day City Heat Risk & Exposed Population Trend
          </h3>
          <p className="text-xs text-[#6F6961] mb-4">
            Evolution of citywide average heat risk score vs vulnerable population count
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heat_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7DED0" />
                <XAxis dataKey="day" stroke="#6F6961" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#B86B45" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#C59A4A" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#252321] text-[#F5F1E8] p-2.5 rounded-xl text-xs font-mono shadow-md">
                          <div className="font-bold text-[#C59A4A] mb-1">{label}</div>
                          <div>City Risk: <b className="text-[#C9674B]">{payload[0]?.value} / 100</b></div>
                          <div>Exposed Pop: <b className="text-[#C59A4A]">{Number(payload[1]?.value).toLocaleString()}</b></div>
                          <div>High-Risk Zones: <b>{payload[0]?.payload.high_risk_zones}</b></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="avg_risk" stroke="#B86B45" strokeWidth={2.5} name="City Heat Risk" />
                <Line yAxisId="right" type="monotone" dataKey="exposed_pop" stroke="#C59A4A" strokeWidth={2} name="Exposed Population" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Municipal Response Times (5 cols) */}
        <div className="lg:col-span-5 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#252321] uppercase tracking-wider mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B86B45]" />
            Municipal Dispatch Response Times
          </h3>
          <p className="text-xs text-[#6F6961] mb-4">
            Average operational dispatch time vs municipal target benchmark
          </p>

          <div className="space-y-3">
            {response_times.map((rt) => (
              <div key={rt.department} className="p-3 bg-[#F5F1E8] rounded-xl border border-[#E7DED0]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#252321]">{rt.department}</span>
                  <span className="font-mono font-bold text-[#B86B45]">{rt.avg_dispatch_min} mins</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6F6961]">
                  <span>Target: {rt.target_min} mins</span>
                  <span>{rt.resolved_pct}% SLA compliance</span>
                </div>
                <div className="h-1.5 w-full bg-[#E7DED0] rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#B86B45] rounded-full"
                    style={{ width: `${(rt.avg_dispatch_min / rt.target_min) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Ward Risk Bar Chart & Spatial Correlations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ward Risk Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#252321] uppercase tracking-wider mb-1">
            Mean Heat Risk by Administrative Ward
          </h3>
          <p className="text-xs text-[#6F6961] mb-4">
            Ranked municipal wards across PMC and PCMC
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ward_risk} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7DED0" />
                <XAxis type="number" domain={[0, 100]} stroke="#6F6961" tick={{ fontSize: 10 }} />
                <YAxis dataKey="ward" type="category" stroke="#6F6961" tick={{ fontSize: 9 }} width={100} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#252321] text-[#F5F1E8] p-2.5 rounded-xl text-xs font-mono shadow-md">
                          <div className="font-bold text-[#C59A4A]">{d.ward}</div>
                          <div>Avg Risk: <b>{d.avg_risk} / 100</b></div>
                          <div>Population: {d.population.toLocaleString()}</div>
                          <div>Max Temp: {d.max_temp}°C</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avg_risk" radius={[0, 6, 6, 0]}>
                  {ward_risk.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.avg_risk >= 80 ? '#9F4937' : entry.avg_risk >= 65 ? '#C9674B' : '#C59A4A'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NDVI vs Risk Correlation (6 cols) */}
        <div className="lg:col-span-6 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#252321] uppercase tracking-wider mb-1">
            Vegetation Deficit (NDVI) vs Heat Risk Score
          </h3>
          <p className="text-xs text-[#6F6961] mb-4">
            Inverse relationship: lower tree canopy directly amplifies localized thermal risk
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7DED0" />
                <XAxis dataKey="ndvi" name="NDVI" domain={[0, 0.8]} stroke="#6F6961" tick={{ fontSize: 10 }} label={{ value: 'NDVI (Canopy Index)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis dataKey="risk_score" name="Risk" domain={[0, 100]} stroke="#6F6961" tick={{ fontSize: 10 }} label={{ value: 'Heat Risk Score', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p = payload[0].payload;
                      return (
                        <div className="bg-[#252321] text-[#F5F1E8] p-2.5 rounded-xl text-xs font-mono shadow-md">
                          <div className="font-bold text-[#C59A4A]">{p.zone_name}</div>
                          <div>NDVI: <b>{p.ndvi}</b></div>
                          <div>Risk Score: <b className="text-[#C9674B]">{p.risk_score}</b></div>
                          <div>Peak Temp: {p.predicted_temp}°C</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={ndvi_vs_risk} fill="#B86B45" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

