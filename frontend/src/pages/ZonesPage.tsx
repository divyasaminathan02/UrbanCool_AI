import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { Zone } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Grid,
  Search,
  ArrowUpDown,
  ArrowRight,
  Users,
  Building
} from 'lucide-react';

export const ZonesPage: React.FC = () => {
  const navigate = useNavigate();
  const { scenario } = useScenario();

  const [zones, setZones] = useState<Zone[]>([]);
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [sortBy, setSortBy] = useState('risk');
  const [isLoading, setIsLoading] = useState(true);

  const loadZones = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getZones(
        scenario,
        selectedWard === 'All' ? undefined : selectedWard,
        sortBy
      );
      setZones(data);
    } catch (e) {
      console.error('Failed to load zones', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, [scenario, selectedWard, sortBy]);

  const wardsList = ['All', 'Shivajinagar', 'Kothrud', 'Hadapsar', 'Swargate', 'Mandai', 'Viman Nagar', 'Yerawada', 'Hinjawadi', 'Bhosari', 'Pimpri', 'Chinchwad', 'Baner', 'Aundh'];

  const filteredZones = zones.filter((z) => {
    const matchSearch =
      z.zone_name.toLowerCase().includes(search.toLowerCase()) ||
      z.ward_name.toLowerCase().includes(search.toLowerCase()) ||
      z.id.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              Microclimate Zones Directory
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              {zones.length} Cells
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Catalog of {zones.length} analyzed ~250m micro-grids across PMC & PCMC administrative wards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6F6961] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search zone, ward, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#FBF9F4] border border-[#E7DED0] rounded-xl text-xs text-[#252321] placeholder-[#6F6961]/60 w-64 focus:outline-hidden focus:border-[#B86B45]"
            />
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Ward Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider mr-1">Ward:</span>
          {wardsList.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedWard === w
                  ? 'bg-[#B86B45] text-white shadow-xs'
                  : 'bg-[#F5F1E8] text-[#6F6961] hover:bg-[#EAE0D0] hover:text-[#252321]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#B86B45]" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs font-bold text-[#252321] focus:outline-hidden focus:border-[#B86B45] cursor-pointer"
          >
            <option value="risk">Highest Heat Risk</option>
            <option value="temperature">Peak Temperature</option>
            <option value="population">Population Exposure</option>
            <option value="ndvi">Lowest Vegetation (NDVI)</option>
          </select>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs hover:border-[#B86B45] transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Zone ID + Risk Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#252321] text-[#F5F1E8]">
                  {zone.id}
                </span>
                <RiskBadge score={zone.risk_score} category={zone.risk_category} size="sm" />
              </div>

              {/* Zone Name & Ward */}
              <h3 className="font-bold text-sm text-[#252321] group-hover:text-[#B86B45] transition-colors leading-snug">
                {zone.zone_name}
              </h3>
              <p className="text-xs text-[#6F6961] mt-0.5">{zone.ward_name} • {zone.land_use}</p>

              {/* Thermal Highlights Box */}
              <div className="mt-3 p-3 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#6F6961] block font-medium">Micro Temp</span>
                  <span className="font-extrabold font-mono text-[#9F4937] text-sm">
                    {zone.predicted_temp}°C
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6961] block font-medium">Anomaly</span>
                  <span className="font-bold font-mono text-[#C9674B] text-sm">
                    +{zone.temp_anomaly}°C
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6961] block font-medium">NDVI</span>
                  <span className="font-bold font-mono text-[#252321] text-sm">
                    {zone.baseline_ndvi.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Demographics & Elevation */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#6F6961]">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#6F6961]" />
                  <span>Pop: <b className="text-[#252321]">{zone.population.toLocaleString()}</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#6F6961]" />
                  <span>Built-up: <b className="text-[#252321]">{intOrPct(zone.built_up_density)}</b></span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-4 pt-3 border-t border-[#E7DED0] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#6F6961]">
                Elevation: {zone.elevation_m}m
              </span>
              <button
                onClick={() => navigate(`/zone/${zone.id}`)}
                className="py-1.5 px-3 bg-[#B86B45]/10 hover:bg-[#B86B45] text-[#B86B45] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Deep Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function intOrPct(val: number) {
  return `${Math.round(val * 100)}%`;
}

