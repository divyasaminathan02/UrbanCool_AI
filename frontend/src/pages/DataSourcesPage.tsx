import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataSourceItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Database,
  Satellite,
  Radio,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSources = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getDataSources();
        setSources(data);
      } catch (e) {
        console.error('Failed to load data sources', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSources();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#12263A] tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-[#18B6A4]" />
            <span>Data Sources & Provenance Registry</span>
          </h1>
          <p className="text-xs text-[#617080] mt-0.5">
            Transparent registry of satellite sensors, topographic models, synoptic meteorology and gridded census feeds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-[#18B6A4]/15 text-[#0D8F82] border border-[#18B6A4]/30 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Open Climate Data Architecture</span>
          </span>
        </div>
      </div>

      {/* Honest Provenance Banner */}
      <div className="bg-white border border-[#DCE4E8] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#12263A] text-white rounded text-[10px] font-bold uppercase">
              Hackathon Data Compliance
            </span>
            <span className="text-xs font-bold text-[#12263A]">Status Transparency Policy</span>
          </div>
          <p className="text-xs text-[#617080] leading-relaxed max-w-3xl">
            In compliance with Grand Challenge standards, live telemetry and open satellite datasets are strictly labeled. Features not connected to paid streaming APIs operate on validated historical downscaling baselines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
            ● LIVE: Active AWS
          </span>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
            ● OPEN DATA: ESA/NASA
          </span>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-white border border-[#DCE4E8] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Provider + Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#12263A] text-white">
                  {src.id}
                </span>
                <StatusBadge status={src.status} type="source" size="sm" />
              </div>

              {/* Source Name & Provider */}
              <h3 className="font-extrabold text-base text-[#12263A] mt-1">
                {src.name}
              </h3>
              <p className="text-xs text-[#0D8F82] font-semibold">{src.provider}</p>

              {/* Data Type & Purpose */}
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">
                    Telemetry Type:
                  </span>
                  <span className="font-semibold text-[#172033]">{src.data_type}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#617080] uppercase tracking-wider block">
                    Downscaling Purpose:
                  </span>
                  <span className="text-[#617080] leading-relaxed block">{src.purpose}</span>
                </div>
              </div>

              {/* Resolution & Frequency Grid */}
              <div className="mt-4 p-3 bg-[#F4F7F8] rounded-xl border border-[#DCE4E8] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#617080] block">Spatial Resolution:</span>
                  <span className="font-mono font-bold text-[#172033]">{src.resolution}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#617080] block">Update Frequency:</span>
                  <span className="font-medium text-[#172033]">{src.update_frequency}</span>
                </div>
              </div>
            </div>

            {/* Footer: Sync + Reliability */}
            <div className="mt-4 pt-3 border-t border-[#DCE4E8] flex items-center justify-between text-xs">
              <span className="text-[#617080] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#18B6A4]" />
                Sync: <b className="text-[#172033]">{src.last_sync}</b>
              </span>
              <span className="text-emerald-700 font-mono font-bold">
                {src.reliability_pct}% Reliability
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
