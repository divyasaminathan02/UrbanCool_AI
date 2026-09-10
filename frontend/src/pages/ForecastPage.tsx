import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { ForecastSummary } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  CalendarDays,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const ForecastPage: React.FC = () => {
  const { scenario } = useScenario();
  const [data, setData] = useState<ForecastSummary | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadForecast = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.getForecast(scenario);
        setData(res);
      } catch (e) {
        console.error('Failed to load forecast', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadForecast();
  }, [scenario]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-[#B86B45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#6F6961]">Loading 48-hour forecast intelligence...</p>
        </div>
      </div>
    );
  }

  const currentDay = data.timeline_days[activeDayIdx] || data.timeline_days[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              48-Hour Microclimate Heat Forecast
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              AI Downscaled
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Hyper-local diurnal temperature trajectories and multi-day thermal risk progression
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-[#FBF9F4] text-[#B86B45] border border-[#E7DED0] rounded-xl shadow-xs">
            City Forecast Base: {data.official_forecast_base}°C
          </span>
        </div>
      </div>

      {/* Core Product Story Callout */}
      <div className="bg-[#252321] text-[#F5F1E8] rounded-3xl p-6 shadow-md border border-[#3E3935]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#B86B45]/20 border border-[#B86B45]/40 rounded-lg text-xs font-bold text-[#C59A4A]">
              <Sparkles className="w-3.5 h-3.5 text-[#C59A4A]" />
              <span>Core Product Differentiator: Localized Downscaling</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              City Synoptic Forecast vs Hyper-Local Microclimate
            </h2>
            <p className="text-xs text-[#E7DED0]/80 leading-relaxed">
              {data.core_story}
            </p>
          </div>

          <div className="bg-[#1C1A18] border border-[#3E3935] p-4 rounded-2xl grid grid-cols-2 gap-3 text-center">
            <div>
              <span className="text-[10px] font-bold text-[#A98245] uppercase tracking-wider block">Official Station</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {data.official_forecast_base}°C
              </span>
              <span className="text-[10px] text-[#E7DED0]/60">IMD City Average</span>
            </div>
            <div className="border-l border-[#3E3935] pl-3">
              <span className="text-[10px] font-bold text-[#C59A4A] uppercase tracking-wider block">UrbanCool Peak</span>
              <span className="text-2xl font-black font-mono text-[#C9674B] mt-1 block">
                {data.localized_max_peak}°C
              </span>
              <span className="text-[10px] text-[#C9674B] font-bold">+{data.mean_thermal_anomaly}°C Mean Delta</span>
            </div>
          </div>
        </div>
      </div>

      {/* 48-Hour Multi-Day Timeline Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {data.timeline_days.map((day, idx) => (
            <button
              key={day.day_label}
              onClick={() => setActiveDayIdx(idx)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                activeDayIdx === idx
                  ? 'bg-[#FBF9F4] border-[#B86B45] shadow-xs font-bold text-[#252321]'
                  : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#FBF9F4]'
              }`}
            >
              <CalendarDays className={`w-4 h-4 ${activeDayIdx === idx ? 'text-[#B86B45]' : 'text-[#6F6961]'}`} />
              <div className="text-left">
                <div className="font-bold">{day.day_label}</div>
                <div className="text-[10px] text-[#6F6961] font-normal">{day.date_text}</div>
              </div>
              <span className="ml-2 font-mono font-black text-sm text-[#9F4937]">
                {day.urban_cool_high}°C
              </span>
            </button>
          ))}
        </div>

        {/* Diurnal Time Slots (Morning, Afternoon, Evening, Night) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentDay.slots.map((slot) => (
            <div
              key={slot.time}
              className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#B86B45] transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#E7DED0] pb-2 mb-3">
                  <span className="text-xs font-bold text-[#252321] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B86B45]" />
                    {slot.time}
                  </span>
                  <RiskBadge category={slot.risk} size="sm" showScore={false} />
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">
                      UrbanCool Localized
                    </span>
                    <div className="text-3xl font-black font-mono text-[#9F4937] mt-0.5">
                      {slot.localized}°C
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-[#F5F1E8] rounded-xl border border-[#E7DED0]">
                    <div>
                      <span className="text-[#6F6961] block">Official IMD:</span>
                      <span className="font-bold text-[#252321] font-mono">{slot.official}°C</span>
                    </div>
                    <div>
                      <span className="text-[#6F6961] block">Heat Index:</span>
                      <span className="font-bold text-[#C9674B] font-mono">{slot.heat_index}°C</span>
                    </div>
                    <div>
                      <span className="text-[#6F6961] block">Humidity:</span>
                      <span className="font-medium text-[#252321]">{slot.humidity}%</span>
                    </div>
                    <div>
                      <span className="text-[#6F6961] block">Confidence:</span>
                      <span className="font-medium text-[#8E9274]">{slot.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7DED0] text-[11px] text-[#6F6961] flex items-center justify-between">
                <span>Microclimate Anomaly</span>
                <span className="font-mono font-bold text-[#C9674B]">
                  +{round(slot.localized - slot.official, 1)}°C
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Localized Anomaly Hotspots Comparison Table */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#B86B45]" />
            Top Thermal Amplification Hotspots vs Official City Station
          </h3>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Micro-zones with highest thermal divergence driven by low NDVI and dense built-up concrete mass
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7DED0] text-[#6F6961] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Zone & Ward</th>
                <th className="py-2.5 px-3">Official IMD Forecast</th>
                <th className="py-2.5 px-3">UrbanCool Localized</th>
                <th className="py-2.5 px-3">Thermal Anomaly (ΔT)</th>
                <th className="py-2.5 px-3">Land-Cover Physical Driver</th>
                <th className="py-2.5 px-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7DED0]">
              {data.hotspot_comparison.map((spot) => (
                <tr key={spot.zone_id} className="hover:bg-[#F5F1E8] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#252321]">{spot.zone_name}</div>
                    <div className="text-[10px] text-[#6F6961]">{spot.ward_name} ({spot.zone_id})</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#6F6961]">{spot.official_temp}°C</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#9F4937] text-sm">{spot.localized_temp}°C</td>
                  <td className="py-3 px-3 font-mono font-black text-[#C9674B]">{spot.anomaly}</td>
                  <td className="py-3 px-3 text-[#252321] font-medium">{spot.land_cover_reason}</td>
                  <td className="py-3 px-3">
                    <RiskBadge category={spot.risk_category} size="sm" showScore={false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function round(val: number, decimals: number) {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}

