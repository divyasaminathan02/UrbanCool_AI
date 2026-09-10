import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataSourceItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Database,
  Clock,
  ShieldCheck
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              Data Sources & Provenance Registry
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              Registry
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Transparent registry of satellite sensors, topographic models, synoptic meteorology and gridded census feeds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-[#FBF9F4] text-[#B86B45] border border-[#E7DED0] rounded-xl flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#B86B45]" />
            <span>Open Climate Data Architecture</span>
          </span>
        </div>
      </div>

      {/* Honest Provenance Banner */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#252321] text-[#F5F1E8] rounded text-[10px] font-bold uppercase">
              Compliance Architecture
            </span>
            <span className="text-xs font-bold text-[#252321]">Status Transparency Policy</span>
          </div>
          <p className="text-xs text-[#6F6961] leading-relaxed max-w-3xl">
            In compliance with Grand Challenge standards, live telemetry and open satellite datasets are strictly labeled. Features not connected to paid streaming APIs operate on validated historical downscaling baselines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <span className="px-2.5 py-1 bg-[#8E9274]/15 text-[#252321] rounded-lg border border-[#8E9274]/30">
            ● LIVE: Active AWS
          </span>
          <span className="px-2.5 py-1 bg-[#C59A4A]/15 text-[#252321] rounded-lg border border-[#C59A4A]/30">
            ● OPEN DATA: ESA/NASA
          </span>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs hover:border-[#B86B45] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Provider + Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#252321] text-[#F5F1E8]">
                  {src.id}
                </span>
                <StatusBadge status={src.status} type="source" size="sm" />
              </div>

              {/* Source Name & Provider */}
              <h3 className="font-extrabold text-base text-[#252321] mt-1">
                {src.name}
              </h3>
              <p className="text-xs text-[#B86B45] font-semibold">{src.provider}</p>

              {/* Data Type & Purpose */}
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">
                    Telemetry Type:
                  </span>
                  <span className="font-semibold text-[#252321]">{src.data_type}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">
                    Downscaling Purpose:
                  </span>
                  <span className="text-[#6F6961] leading-relaxed block">{src.purpose}</span>
                </div>
              </div>

              {/* Resolution & Frequency Grid */}
              <div className="mt-4 p-3 bg-[#F5F1E8] rounded-xl border border-[#E7DED0] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#6F6961] block">Spatial Resolution:</span>
                  <span className="font-mono font-bold text-[#252321]">{src.resolution}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6961] block">Update Frequency:</span>
                  <span className="font-medium text-[#252321]">{src.update_frequency}</span>
                </div>
              </div>
            </div>

            {/* Footer: Sync + Reliability */}
            <div className="mt-4 pt-3 border-t border-[#E7DED0] flex items-center justify-between text-xs">
              <span className="text-[#6F6961] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B86B45]" />
                Sync: <b className="text-[#252321]">{src.last_sync}</b>
              </span>
              <span className="text-[#8E9274] font-mono font-bold">
                {src.reliability_pct}% Reliability
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

