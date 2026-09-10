import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { Recommendation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  CheckSquare,
  Droplets,
  Building,
  BellRing,
  TreePine,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { scenario } = useScenario();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getRecommendations(
        scenario,
        selectedCategory,
        selectedPriority,
        selectedStatus
      );
      setRecommendations(data);
    } catch (e) {
      console.error('Failed to load recommendations', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [scenario, selectedCategory, selectedPriority, selectedStatus]);

  const handleStatusChange = async (recId: string, newStatus: string) => {
    try {
      await apiService.updateRecommendationStatus(recId, newStatus);
      setActionSuccess(`Recommendation marked as ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 2500);
      loadRecommendations();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const categories = [
    { id: 'All', label: 'All Categories', icon: CheckSquare },
    { id: 'Water', label: 'Water & Tankers', icon: Droplets },
    { id: 'Cooling Centers', label: 'Cooling Shelters', icon: Building },
    { id: 'Public Alerts', label: 'Public Alerts', icon: BellRing },
    { id: 'Tree Canopy', label: 'Tree Canopy', icon: TreePine },
    { id: 'Electricity Demand', label: 'Electricity Grid', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              Municipal Action Advisories
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              Rule Engine
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Deterministic rule-engine recommendations prioritized by thermal risk, population exposure and canopy deficit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/interventions')}
            className="px-4 py-2 bg-[#B86B45] hover:bg-[#925238] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Open Operational Dispatch</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F5F1E8]" />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#8E9274]" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Category Pills & Filters */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#B86B45] text-white shadow-xs'
                    : 'bg-[#F5F1E8] text-[#6F6961] hover:bg-[#EAE0D0] hover:text-[#252321]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${selectedCategory === cat.id ? 'text-[#F5F1E8]' : 'text-[#6F6961]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Priority & Status dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E7DED0] text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-semibold text-[#252321] focus:outline-hidden focus:border-[#B86B45] cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-semibold text-[#252321] focus:outline-hidden focus:border-[#B86B45] cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="NEW">New</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="IN PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <span className="text-[#6F6961] font-medium">
            Showing <b className="text-[#252321]">{recommendations.length}</b> actionable advisories
          </span>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs hover:border-[#B86B45] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Priority + Category + Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={rec.priority} type="priority" size="sm" />
                  <span className="text-xs font-bold text-[#B86B45] px-2 py-0.5 bg-[#B86B45]/10 rounded-md border border-[#B86B45]/20">
                    {rec.category}
                  </span>
                </div>
                <StatusBadge status={rec.status} size="sm" />
              </div>

              {/* Title & Location */}
              <h3 className="font-extrabold text-sm text-[#252321] leading-snug mt-2">
                {rec.action_title}
              </h3>
              <p className="text-xs text-[#B86B45] font-semibold mt-0.5">
                {rec.zone_name} • Ward {rec.ward_name} ({rec.zone_id})
              </p>

              {/* Description / Reason */}
              <p className="text-xs text-[#6F6961] mt-2 leading-relaxed">
                {rec.description}
              </p>

              {/* Impact Callout */}
              <div className="mt-3 p-3 bg-[#F5F1E8] rounded-xl border border-[#E7DED0] text-xs">
                <span className="font-bold text-[#252321] block mb-0.5">Expected Municipal Impact:</span>
                <span className="text-[#8E9274] font-semibold">{rec.expected_impact}</span>
              </div>

              {/* Department & Deadline */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#6F6961]">
                <div>
                  <span className="block font-medium text-[#6F6961]">Assigned To:</span>
                  <span className="text-[#252321] font-semibold truncate block">{rec.assigned_department}</span>
                </div>
                <div>
                  <span className="block font-medium text-[#6F6961]">Operational Window:</span>
                  <span className="text-[#9F4937] font-semibold truncate block flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.deadline_text}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Change Interactive Buttons */}
            <div className="mt-4 pt-3 border-t border-[#E7DED0] flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider">Update Status:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ACKNOWLEDGED', 'DISPATCHED', 'IN PROGRESS', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(rec.id, st)}
                    disabled={rec.status === st}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40 ${
                      rec.status === st
                        ? 'bg-[#B86B45] text-white'
                        : 'bg-[#F5F1E8] hover:bg-[#EAE0D0] text-[#6F6961] border border-[#E7DED0]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

