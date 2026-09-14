import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { ForecastSummary } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { OfficerBanner } from '../components/common/OfficerBanner';
import {
  CalendarDays,
  Clock,
  Sparkles,
  TrendingUp,
  Droplets,
  HeartPulse,
  TreePine,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const ForecastPage: React.FC = () => {
  const { scenario } = useScenario();
  const { role, officerInfo } = useAuth();

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
      {/* Dynamic Officer Directive HUD */}
      <OfficerBanner compact />

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
            Hyper-local diurnal temperature trajectories and operational windows for <span className="font-bold text-[#252321]">{officerInfo.fullName}</span>
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
              <span className="text-2xl font-black text-[#F5F1E8]">{data.official_forecast_base}°C</span>
              <span className="text-[10px] text-[#A98245] block mt-0.5">IMD City Average</span>
            </div>
            <div className="border-l border-[#3E3935] pl-3">
              <span className="text-[10px] font-bold text-[#C9674B] uppercase tracking-wider block">UrbanCool Peak</span>
              <span className="text-2xl font-black text-[#C9674B]">{data.localized_max_peak}°C</span>
              <span className="text-[10px] text-[#C9674B] block mt-0.5 font-bold">+{data.mean_thermal_anomaly}°C Microclimate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Officer Operational Action Advisory Matrix */}
      <div className="p-4 rounded-2xl border border-[#E7DED0] bg-[#F5F1E8]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#252321] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B86B45]" />
            Department Protocol Matrix: {officerInfo.department}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#B86B45]/15 text-[#B86B45]">
            Role Protocol
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#FBF9F4] rounded-xl border border-[#E7DED0]">
            <span className="font-bold text-[#A98245] block text-[10px] uppercase">06:00 - 11:00 (Morning)</span>
            <span className="font-semibold text-[#252321] mt-1 block">
              {role === 'WATER_OFFICER' ? 'Refill tanker reservoirs at PMC hydrants & position mist cannons.' : role === 'PUBLIC_HEALTH' ? 'Verify ORS hydration packs & activate community hall cooling units.' : role === 'PLANNER' ? 'Audit shade canopy utilization along pedestrian transit links.' : 'Issue daily heat bulletin & coordinate inter-agency standby.'}
            </span>
          </div>
          <div className="p-3 bg-[#FBF9F4] rounded-xl border border-[#9F4937]/30 bg-[#9F4937]/5">
            <span className="font-bold text-[#9F4937] block text-[10px] uppercase">12:00 - 16:30 (Peak Anomaly)</span>
            <span className="font-semibold text-[#9F4937] mt-1 block">
              {role === 'WATER_OFFICER' ? 'Full active misting in Swargate, Hadapsar & Mandai (+4.5°C peak).' : role === 'PUBLIC_HEALTH' ? 'Enforce emergency hospital triage beds for heatstroke cases.' : role === 'PLANNER' ? 'Record thermal radiation peaks on exposed unshaded asphalt corridors.' : 'Enforce mandatory outdoor labor moratorium from 12:00 to 16:00.'}
            </span>
          </div>
          <div className="p-3 bg-[#FBF9F4] rounded-xl border border-[#E7DED0]">
            <span className="font-bold text-[#4E523A] block text-[10px] uppercase">17:00 - 20:00 (Evening)</span>
            <span className="font-semibold text-[#252321] mt-1 block">
              {role === 'WATER_OFFICER' ? 'Evaluate water expenditure & replenish tankers for morning shift.' : role === 'PUBLIC_HEALTH' ? 'Log daily heatstroke intake & report morbidity statistics.' : role === 'PLANNER' ? 'Benchmark nocturnal heat retention in dense built-up cells.' : 'Review day incident log & configure next-day alert thresholds.'}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Day Timeline Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {data.timeline_days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDayIdx(idx)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeDayIdx === idx
                  ? 'bg-[#FBF9F4] border-[#B86B45] shadow-sm text-[#252321]'
                  : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#EAE2D5]'
              }`}
            >
              <CalendarDays className={`w-5 h-5 ${activeDayIdx === idx ? 'text-[#B86B45]' : 'text-[#A98245]'}`} />
              <div>
                <div className="text-xs font-bold">{day.day_label}</div>
                <div className="text-[10px] font-medium opacity-75">{day.date_text}</div>
              </div>
              <div className="pl-3 border-l border-[#E7DED0] text-right">
                <div className="text-xs font-black text-[#9F4937]">{day.urban_cool_high}°C</div>
                <div className="text-[9px] text-[#6F6961]">Peak Localized</div>
              </div>
            </button>
          ))}
        </div>

        {/* 4 Diurnal Slots (Morning, Afternoon, Evening, Night) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentDay.slots.map((slot, sIdx) => (
            <div
              key={sIdx}
              className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#252321] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B86B45]" />
                  {slot.time}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C59A4A]/15 text-[#8E6A26]">
                  {slot.risk}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#6F6961] block">UrbanCool Localized</span>
                <span className="text-3xl font-black text-[#252321] tracking-tight">
                  {slot.localized}°C
                </span>
              </div>

              <div className="bg-[#F5F1E8] rounded-xl p-3 text-xs space-y-1 text-[#6F6961]">
                <div className="flex justify-between">
                  <span>Official IMD:</span>
                  <span className="font-semibold text-[#252321]">{slot.official}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Heat Index:</span>
                  <span className="font-bold text-[#9F4937]">{slot.heat_index}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span className="font-semibold text-[#252321]">{slot.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-semibold text-[#8E9274]">{slot.confidence}%</span>
                </div>
              </div>

              <div className="text-[11px] text-[#A0462C] font-semibold pt-1 border-t border-[#E7DED0]">
                Microclimate Anomaly: +{(slot.localized - slot.official).toFixed(1)}°C
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
