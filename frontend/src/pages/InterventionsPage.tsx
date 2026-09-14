import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Intervention } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { OfficerBanner } from '../components/common/OfficerBanner';
import {
  Truck,
  Building,
  Droplets,
  CheckCircle2,
  Plus,
  Timer,
  TreePine,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const InterventionsPage: React.FC = () => {
  const { scenario } = useScenario();
  const { role, officerInfo } = useAuth();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedType, setSelectedType] = useState<string>(officerInfo.defaultInterventionType);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Dispatch Form State
  const [zoneId, setZoneId] = useState('PMC-W21-G088');
  const [interventionType, setInterventionType] = useState(
    role === 'WATER_OFFICER' ? 'Water Tanker' : role === 'PLANNER' ? 'Tree Plantation' : role === 'PUBLIC_HEALTH' ? 'Cooling Shelter Activation' : 'Water Tanker'
  );
  const [targetLocation, setTargetLocation] = useState('Hadapsar East Industrial Core');
  const [suggestedDispatch, setSuggestedDispatch] = useState('2 Municipal Tankers (10,000L)');
  const [priority, setPriority] = useState('CRITICAL');

  // Synchronize type filter when officer changes
  useEffect(() => {
    setSelectedType(officerInfo.defaultInterventionType);
    setInterventionType(
      role === 'WATER_OFFICER' ? 'Water Tanker' : role === 'PLANNER' ? 'Tree Plantation' : role === 'PUBLIC_HEALTH' ? 'Cooling Shelter Activation' : 'Water Tanker'
    );
  }, [role, officerInfo]);

  const loadInterventions = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getInterventions(scenario, selectedStatus, selectedType);
      setInterventions(data);
    } catch (e) {
      console.error('Failed to load interventions', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInterventions();
  }, [scenario, selectedStatus, selectedType]);

  const handleStatusUpdate = async (intvId: string, newStatus: string) => {
    try {
      await apiService.updateInterventionStatus(intvId, newStatus);
      setToastMessage(`Operation status updated to ${newStatus}`);
      setTimeout(() => setToastMessage(null), 2500);
      loadInterventions();
    } catch (e) {
      console.error('Failed to update intervention status', e);
    }
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createIntervention({
        zone_id: zoneId,
        title: `${interventionType} Fleet — ${targetLocation}`,
        intervention_type: interventionType,
        priority: priority,
        target_location: targetLocation,
        reason: `Emergency dispatch triggered by ${officerInfo.fullName} (${officerInfo.badgeLabel}) for ${targetLocation}`,
        suggested_dispatch: suggestedDispatch,
        assigned_department: officerInfo.department,
        scenario: scenario,
      });
      setShowDispatchModal(false);
      setToastMessage('New operational fleet dispatched successfully!');
      setTimeout(() => setToastMessage(null), 2500);
      loadInterventions();
    } catch (e) {
      console.error('Failed to create dispatch', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Officer Directive HUD */}
      <OfficerBanner compact />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              Municipal Interventions & Fleet Operations
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              Fleet Command
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Operational fleet and logistics management for <span className="font-bold text-[#252321]">{officerInfo.department}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDispatchModal(true)}
            className="px-4 py-2 bg-[#B86B45] hover:bg-[#925238] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch New Operation</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#8E9274]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Operation Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#F5F1E8] border border-[#E7DED0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#252321] focus:outline-none"
            >
              <option value="All">All Operations</option>
              <option value="Water Tanker">Water Tankers</option>
              <option value="Cooling Center">Cooling Centers</option>
              <option value="Mist Cannon">Mist Cannons</option>
              <option value="Tree Plantation">Tree Plantation</option>
              <option value="Cool Roof">Cool Roofs</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F5F1E8] border border-[#E7DED0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#252321] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="NEW">Pending</option>
              <option value="RESOLVED">Completed</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#6F6961] font-medium">
          Showing <span className="font-bold text-[#252321]">{interventions.length}</span> active operations
        </div>
      </div>

      {/* Interventions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#B86B45] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : interventions.length === 0 ? (
        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-12 text-center">
          <Truck className="w-12 h-12 text-[#A98245] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#252321]">No operations matching filter</h3>
          <p className="text-xs text-[#6F6961] mt-1">Select All Operations to see active dispatches across all municipal cells.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interventions.map((intv) => (
            <div
              key={intv.id}
              className="bg-[#FBF9F4] border border-[#E7DED0] hover:border-[#B86B45] rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#B86B45]/15 text-[#B86B45] rounded">
                    {intv.id}
                  </span>
                  <StatusBadge status={intv.status} />
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#252321]">{intv.title}</h3>
                  <p className="text-xs text-[#6F6961] mt-1 line-clamp-2">{intv.reason}</p>
                </div>

                <div className="bg-[#F5F1E8] border border-[#E7DED0] rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6961] text-[11px]">Location:</span>
                    <span className="font-semibold text-[#252321]">{intv.target_location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6961] text-[11px]">Dispatch:</span>
                    <span className="font-bold text-[#252321]">{intv.suggested_dispatch}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6961] text-[11px]">Assigned Unit:</span>
                    <span className="text-[11px] text-[#252321]">{intv.assigned_department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6961] text-[11px]">Expected Delta:</span>
                    <span className="font-bold text-[#8E9274]">{intv.impact_metric}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mt-4 pt-3 border-t border-[#E7DED0] flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-[#6F6961]">
                  <Timer className="w-3.5 h-3.5 text-[#B86B45]" />
                  <span>ETA: ~{intv.eta_minutes} min</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {intv.status === 'DISPATCHED' && (
                    <button
                      onClick={() => handleStatusUpdate(intv.id, 'IN PROGRESS')}
                      className="px-2.5 py-1 bg-[#C59A4A] hover:bg-[#A98245] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      In Progress
                    </button>
                  )}
                  {intv.status === 'IN PROGRESS' && (
                    <button
                      onClick={() => handleStatusUpdate(intv.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-[#8E9274] hover:bg-[#686C50] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                  {intv.status === 'NEW' && (
                    <button
                      onClick={() => handleStatusUpdate(intv.id, 'DISPATCHED')}
                      className="px-2.5 py-1 bg-[#B86B45] hover:bg-[#925238] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Dispatch Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DED0] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#252321]">Deploy Operational Unit</h3>
                <p className="text-xs text-[#6F6961]">Authorizing as {officerInfo.fullName} ({officerInfo.badgeLabel})</p>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-[#6F6961] hover:text-[#252321] text-xs font-bold px-2 py-1 bg-[#F5F1E8] rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#252321] block mb-1">Target Microclimate Zone</label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#E7DED0] rounded-xl px-3 py-2 text-xs font-semibold text-[#252321] focus:outline-none"
                >
                  <option value="PMC-W21-G088">PMC-W21-G088 — Hadapsar East Industrial & Market (Extreme 88.5 Risk)</option>
                  <option value="PMC-W17-G042">PMC-W17-G042 — Shivajinagar Transit Hub (Extreme 86.4 Risk)</option>
                  <option value="PMC-W14-G031">PMC-W14-G031 — Mandai Market Core (Very High 84.1 Risk)</option>
                  <option value="PMC-W04-G024">PMC-W04-G024 — Yerawada Residential (Very High 82.3 Risk)</option>
                  <option value="PMC-W09-G015">PMC-W09-G015 — Swargate Transit Junction (Very High 81.7 Risk)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#252321] block mb-1">Operation Type</label>
                  <select
                    value={interventionType}
                    onChange={(e) => setInterventionType(e.target.value)}
                    className="w-full bg-[#F5F1E8] border border-[#E7DED0] rounded-xl px-3 py-2 text-xs font-semibold text-[#252321] focus:outline-none"
                  >
                    <option value="Water Tanker">Water Tanker</option>
                    <option value="Mist Cannon">Evaporative Mist Cannon</option>
                    <option value="Cooling Center">Cooling Shelter</option>
                    <option value="Tree Plantation">Canopy Planting</option>
                    <option value="Cool Roof">Cool Roof Retrofit</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#252321] block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#F5F1E8] border border-[#E7DED0] rounded-xl px-3 py-2 text-xs font-semibold text-[#252321] focus:outline-none"
                  >
                    <option value="CRITICAL">Critical (Immediate)</option>
                    <option value="HIGH">High (Within 30 min)</option>
                    <option value="MEDIUM">Medium (Within 2 hours)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#252321] block mb-1">Target Specific Location</label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#E7DED0] rounded-xl px-3 py-2 text-xs text-[#252321] focus:outline-none"
                  placeholder="e.g. Swargate Bus Stand Transit Platform 4"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#252321] block mb-1">Suggested Resource Allocation</label>
                <input
                  type="text"
                  value={suggestedDispatch}
                  onChange={(e) => setSuggestedDispatch(e.target.value)}
                  className="w-full bg-[#F5F1E8] border border-[#E7DED0] rounded-xl px-3 py-2 text-xs text-[#252321] focus:outline-none"
                  placeholder="e.g. 2 Municipal Tankers (10,000L) + 1 High-Pressure Mist Cannon"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#E7DED0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-[#F5F1E8] text-[#6F6961] font-bold rounded-xl hover:bg-[#EAE2D5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B86B45] hover:bg-[#925238] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Authorize Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
