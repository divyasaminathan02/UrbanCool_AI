import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GeoJSONFeature } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  X,
  Thermometer,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  TreePine,
  Building,
  Wind,
  Users,
  Droplets,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface ZoneIntelligencePanelProps {
  feature: GeoJSONFeature | null;
  onClose: () => void;
  onDispatchTanker?: (zoneId: string, zoneName: string) => void;
}

export const ZoneIntelligencePanel: React.FC<ZoneIntelligencePanelProps> = ({
  feature,
  onClose,
  onDispatchTanker,
}) => {
  const navigate = useNavigate();

  if (!feature) return null;
  const p = feature.properties;
  const d = p.drivers;

  return (
    <div className="bg-white border border-[#DCE4E8] rounded-2xl shadow-xl p-5 w-full flex flex-col justify-between max-h-[800px] overflow-y-auto animate-in fade-in slide-in-from-right-2">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-[#DCE4E8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#12263A] text-white">
                {p.zone_id}
              </span>
              <span className="text-xs text-[#617080]">{p.ward_name}</span>
            </div>
            <h2 className="text-lg font-bold text-[#12263A] mt-1.5 leading-snug">
              {p.zone_name}
            </h2>
            <p className="text-xs text-[#617080] mt-0.5">{p.land_use}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F4F7F8] rounded-xl text-[#617080] hover:text-[#172033] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Risk & Anomaly Headline Card */}
        <div className="mt-4 p-4 rounded-xl bg-[#F4F7F8] border border-[#DCE4E8] grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider">Heat Risk Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-[#12263A] font-mono">{p.risk_score}</span>
              <span className="text-xs text-[#617080]">/ 100</span>
            </div>
            <div className="mt-1">
              <RiskBadge score={p.risk_score} category={p.risk_category} size="sm" />
            </div>
          </div>

          <div className="border-l border-[#DCE4E8] pl-3">
            <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider">Thermal Anomaly</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-[#D9534F] font-mono">+{p.temp_anomaly}°C</span>
            </div>
            <p className="text-[11px] text-[#617080] mt-0.5">
              Local <span className="font-bold text-[#172033]">{p.predicted_temp}°C</span> vs City <span className="font-medium">{p.official_temp}°C</span>
            </p>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-white border border-[#DCE4E8] rounded-xl">
            <span className="text-[10px] text-[#617080] block">Surface LST</span>
            <span className="font-bold font-mono text-sm text-[#172033]">{p.lst_celsius}°C</span>
          </div>
          <div className="p-2.5 bg-white border border-[#DCE4E8] rounded-xl">
            <span className="text-[10px] text-[#617080] block">NDVI Canopy</span>
            <span className="font-bold font-mono text-sm text-[#172033]">{p.baseline_ndvi.toFixed(2)}</span>
          </div>
          <div className="p-2.5 bg-white border border-[#DCE4E8] rounded-xl">
            <span className="text-[10px] text-[#617080] block">Exposed Pop</span>
            <span className="font-bold font-mono text-sm text-[#172033]">{p.population.toLocaleString()}</span>
          </div>
        </div>

        {/* Feature Contribution Estimate Drivers */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#18B6A4]" />
              Model Feature Contribution Estimate
            </span>
            <span className="text-[10px] text-[#617080] font-mono">Confidence {p.confidence_pct}%</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#172033] font-medium flex items-center gap-1.5">
                  <TreePine className="w-3.5 h-3.5 text-[#0D8F82]" />
                  Vegetation Deficit (Low NDVI)
                </span>
                <span className="font-mono font-bold text-[#12263A]">{d.ndvi_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E5ECF0] rounded-full overflow-hidden">
                <div className="h-full bg-[#18B6A4] rounded-full" style={{ width: `${d.ndvi_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#172033] font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#C9543C]" />
                  Built-up Thermal Mass Density
                </span>
                <span className="font-mono font-bold text-[#12263A]">{d.built_up_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E5ECF0] rounded-full overflow-hidden">
                <div className="h-full bg-[#EF8069] rounded-full" style={{ width: `${d.built_up_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#172033] font-medium flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-[#D9534F]" />
                  Surface LST Retention
                </span>
                <span className="font-mono font-bold text-[#12263A]">{d.lst_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E5ECF0] rounded-full overflow-hidden">
                <div className="h-full bg-[#D9534F] rounded-full" style={{ width: `${d.lst_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#172033] font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#B88114]" />
                  Population Exposure Priority
                </span>
                <span className="font-mono font-bold text-[#12263A]">{d.population_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E5ECF0] rounded-full overflow-hidden">
                <div className="h-full bg-[#F4B942] rounded-full" style={{ width: `${d.population_pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Explainable AI Narrative Container */}
        <div className="mt-5 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D8F82] mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Why this zone is at risk</span>
          </div>
          <p className="text-xs text-[#172033] leading-relaxed">
            {p.explainable_summary}
          </p>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-6 pt-4 border-t border-[#DCE4E8] flex items-center gap-2">
        <button
          onClick={() => {
            if (onDispatchTanker) onDispatchTanker(p.zone_id, p.zone_name);
            else navigate('/interventions');
          }}
          className="flex-1 py-2.5 px-3 bg-[#12263A] hover:bg-[#1B344D] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5 text-[#18B6A4]" />
          <span>Dispatch Water Tanker</span>
        </button>

        <button
          onClick={() => navigate(`/zone/${p.zone_id}`)}
          className="py-2.5 px-3 bg-[#F4F7F8] hover:bg-[#EAEFF2] border border-[#DCE4E8] text-[#12263A] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Deep Dive</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#617080]" />
        </button>
      </div>
    </div>
  );
};
