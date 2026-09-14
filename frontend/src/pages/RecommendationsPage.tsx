import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenario } from '../context/ScenarioContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Recommendation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { OfficerBanner } from '../components/common/OfficerBanner';
import {
  CheckSquare,
  Droplets,
  Building,
  BellRing,
  TreePine,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { scenario } = useScenario();
  const { role, officerInfo } = useAuth();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(officerInfo.defaultRecCategory);
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Synchronize category filter whenever the officer role changes
  useEffect(() => {
    setSelectedCategory(officerInfo.defaultRecCategory);
  }, [role, officerInfo]);

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
      {/* Dynamic Officer Directive HUD */}
      <OfficerBanner compact />

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
            Deterministic rule-engine recommendations prioritized for <span className="font-bold text-[#252321]">{officerInfo.department}</span>
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

      {/* Role Department Notice */}
      {selectedCategory !== 'All' && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E7DED0] bg-[#F5F1E8] text-xs">
          <div className="flex items-center gap-2 text-[#252321]">
            <Sparkles className="w-4 h-4 text-[#B86B45]" />
            <span>
              Auto-filtered to <span className="font-bold">{selectedCategory}</span> advisories matching <strong>{officerInfo.fullName} ({officerInfo.badgeLabel})</strong>.
            </span>
          </div>
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-[11px] font-bold text-[#B86B45] hover:underline cursor-pointer"
          >
            Show All Categories ({recommendations.length})
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#8E9274]" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const isRoleDefault = officerInfo.defaultRecCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer border ${
                isSelected
                  ? 'bg-[#B86B45] text-white border-[#B86B45]'
                  : 'bg-[#FBF9F4] text-[#6F6961] border-[#E7DED0] hover:bg-[#F5F1E8] hover:text-[#252321]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              {isRoleDefault && cat.id !== 'All' && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-[#B86B45]/15 text-[#B86B45]'}`}>
                  Role Mandate
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Bar */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-[#F5F1E8] border border-[#E7DED0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#252321] focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Lifecycle Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F5F1E8] border border-[#E7DED0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#252321] focus:outline-none"
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

        <div className="text-xs text-[#6F6961] font-medium">
          Showing <span className="font-bold text-[#252321]">{recommendations.length}</span> actionable items
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#B86B45] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-12 text-center">
          <CheckSquare className="w-12 h-12 text-[#A98245] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#252321]">No matching advisories found</h3>
          <p className="text-xs text-[#6F6961] mt-1">Try relaxing your filter criteria or select All Categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-[#FBF9F4] border border-[#E7DED0] hover:border-[#B86B45] rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#B86B45]/15 text-[#B86B45] rounded-md uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        rec.priority === 'CRITICAL'
                          ? 'bg-[#9F4937]/15 text-[#9F4937]'
                          : rec.priority === 'HIGH'
                          ? 'bg-[#C9674B]/15 text-[#C9674B]'
                          : 'bg-[#C59A4A]/15 text-[#8E6A26]'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <StatusBadge status={rec.status} />
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-[#252321]">{rec.action_title}</h3>
                  <p className="text-xs text-[#6F6961] leading-relaxed mt-1">{rec.description}</p>
                </div>

                <div className="bg-[#F5F1E8] border border-[#E7DED0] rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6961] font-medium text-[11px]">Expected Impact:</span>
                    <span className="font-bold text-[#252321]">{rec.expected_impact}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6961] font-medium text-[11px]">Assigned Unit:</span>
                    <span className="font-medium text-[#252321]">{rec.assigned_department}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-4 pt-3 border-t border-[#E7DED0] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#6F6961]">
                  <Clock className="w-3.5 h-3.5 text-[#A98245]" />
                  <span>{rec.deadline_text}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {rec.status === 'NEW' && (
                    <button
                      onClick={() => handleStatusChange(rec.id, 'ACKNOWLEDGED')}
                      className="px-2.5 py-1.5 bg-[#F5F1E8] hover:bg-[#EAE2D5] text-[#252321] border border-[#E7DED0] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {rec.status !== 'DISPATCHED' && rec.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusChange(rec.id, 'DISPATCHED')}
                      className="px-3 py-1.5 bg-[#B86B45] hover:bg-[#925238] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Dispatch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {rec.status === 'DISPATCHED' && (
                    <button
                      onClick={() => handleStatusChange(rec.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-[#8E9274] hover:bg-[#686C50] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
