import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GeoJSONFeature } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  X,
  Thermometer,
  TrendingUp,
  TreePine,
  Building,
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
    <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl shadow-md p-5 w-full flex flex-col justify-between max-h-[800px] overflow-y-auto animate-in fade-in slide-in-from-right-2">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-[#E7DED0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#252321] text-[#FBF9F4]">
                {p.zone_id}
              </span>
              <span className="text-xs text-[#6F6961] font-medium">{p.ward_name}</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#252321] mt-1.5 leading-snug">
              {p.zone_name}
            </h2>
            <p className="text-xs text-[#6F6961] mt-0.5">{p.land_use}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F5F1E8] rounded-xl text-[#6F6961] hover:text-[#252321] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Risk & Anomaly Headline Card */}
        <div className="mt-4 p-4 rounded-xl bg-[#F5F1E8] border border-[#E7DED0] grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider">Heat Risk Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#252321] font-mono">{p.risk_score}</span>
              <span className="text-xs text-[#6F6961]">/ 100</span>
            </div>
            <div className="mt-1">
              <RiskBadge score={p.risk_score} category={p.risk_category} size="sm" />
            </div>
          </div>

          <div className="border-l border-[#E7DED0] pl-3">
            <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider">Thermal Anomaly</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#C9674B] font-mono">+{p.temp_anomaly}°C</span>
            </div>
            <p className="text-[11px] text-[#6F6961] mt-0.5">
              Local <span className="font-bold text-[#252321]">{p.predicted_temp}°C</span> vs City <span className="font-medium">{p.official_temp}°C</span>
            </p>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-[#FBF9F4] border border-[#E7DED0] rounded-xl">
            <span className="text-[10px] text-[#6F6961] block">Surface LST</span>
            <span className="font-black font-mono text-sm text-[#252321]">{p.lst_celsius}°C</span>
          </div>
          <div className="p-2.5 bg-[#FBF9F4] border border-[#E7DED0] rounded-xl">
            <span className="text-[10px] text-[#6F6961] block">NDVI Canopy</span>
            <span className="font-bold font-mono text-sm text-[#252321]">{p.baseline_ndvi.toFixed(2)}</span>
          </div>
          <div className="p-2.5 bg-[#FBF9F4] border border-[#E7DED0] rounded-xl">
            <span className="text-[10px] text-[#6F6961] block">Exposed Pop</span>
            <span className="font-bold font-mono text-sm text-[#252321]">{p.population.toLocaleString()}</span>
          </div>
        </div>

        {/* Feature Contribution Estimate Drivers */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#B86B45]" />
              Model Feature Contribution Estimate
            </span>
            <span className="text-[10px] text-[#6F6961] font-mono">Confidence {p.confidence_pct}%</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#252321] font-medium flex items-center gap-1.5">
                  <TreePine className="w-3.5 h-3.5 text-[#B86B45]" />
                  Vegetation Deficit (Low NDVI)
                </span>
                <span className="font-mono font-bold text-[#252321]">{d.ndvi_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E7DED0] rounded-full overflow-hidden">
                <div className="h-full bg-[#B86B45] rounded-full" style={{ width: `${d.ndvi_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#252321] font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#C9674B]" />
                  Built-up Thermal Mass Density
                </span>
                <span className="font-mono font-bold text-[#252321]">{d.built_up_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E7DED0] rounded-full overflow-hidden">
                <div className="h-full bg-[#C9674B] rounded-full" style={{ width: `${d.built_up_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#252321] font-medium flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-[#9F4937]" />
                  Surface LST Retention
                </span>
                <span className="font-mono font-bold text-[#252321]">{d.lst_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E7DED0] rounded-full overflow-hidden">
                <div className="h-full bg-[#9F4937] rounded-full" style={{ width: `${d.lst_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#252321] font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C59A4A]" />
                  Population Exposure Priority
                </span>
                <span className="font-mono font-bold text-[#252321]">{d.population_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E7DED0] rounded-full overflow-hidden">
                <div className="h-full bg-[#C59A4A] rounded-full" style={{ width: `${d.population_pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Explainable AI Narrative Container */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#F5F1E8] border border-[#E7DED0]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#B86B45] mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Why this zone is at risk</span>
          </div>
          <p className="text-xs text-[#252321] leading-relaxed">
            {p.explainable_summary}
          </p>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-6 pt-4 border-t border-[#E7DED0] flex items-center gap-2">
        <button
          onClick={() => {
            if (onDispatchTanker) onDispatchTanker(p.zone_id, p.zone_name);
            else navigate('/interventions');
          }}
          className="flex-1 py-2.5 px-3 bg-[#B86B45] hover:bg-[#925238] text-[#FBF9F4] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5 text-[#FBF9F4]" />
          <span>Dispatch Water Tanker</span>
        </button>

        <button
          onClick={() => navigate(`/zone/${p.zone_id}`)}
          className="py-2.5 px-3 bg-[#F5F1E8] hover:bg-[#EAE2D5] border border-[#E7DED0] text-[#252321] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Deep Dive</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#6F6961]" />
        </button>
      </div>
    </div>
  );
};
