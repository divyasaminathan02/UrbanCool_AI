import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { Intervention } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Truck,
  Building,
  Droplets,
  CheckCircle2,
  Plus,
  Timer
} from 'lucide-react';

export const InterventionsPage: React.FC = () => {
  const { scenario } = useScenario();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Dispatch Form State
  const [zoneId, setZoneId] = useState('PMC-W21-G088');
  const [interventionType, setInterventionType] = useState('Water Tanker');
  const [targetLocation, setTargetLocation] = useState('Hadapsar East Industrial Core');
  const [suggestedDispatch, setSuggestedDispatch] = useState('2 Municipal Tankers (10,000L)');
  const [priority, setPriority] = useState('CRITICAL');

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
        reason: `Emergency dispatch triggered by operator for ${targetLocation}`,
        suggested_dispatch: suggestedDispatch,
        assigned_department: interventionType === 'Water Tanker' ? 'Water Supply & Emergency Services' : 'Public Health & Social Welfare',
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
            Real-time tracking of water tanker deployments, mist cannons, and emergency cooling shelters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDispatchModal(true)}
            className="px-4 py-2 bg-[#B86B45] hover:bg-[#925238] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F5F1E8]" />
            <span>New Emergency Dispatch</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#8E9274]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Operational KPIs Bar */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-semibold text-[#252321] focus:outline-hidden focus:border-[#B86B45] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Water Tanker">Water Tankers</option>
              <option value="Cooling Center">Cooling Shelters</option>
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
              <option value="DISPATCHED">Dispatched</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="NEW">New</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-[#6F6961]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B86B45] animate-ping" />
            <b className="text-[#252321]">{interventions.filter((i) => i.status === 'DISPATCHED').length}</b> En Route
          </span>
          <span className="border-l border-[#E7DED0] pl-3">
            <b className="text-[#252321]">{interventions.filter((i) => i.status === 'IN PROGRESS').length}</b> Active On Site
          </span>
        </div>
      </div>

      {/* Interventions Hybrid Cards / Table List */}
      <div className="space-y-3">
        {interventions.map((intv) => {
          const isWater = intv.intervention_type.includes('Water');

          return (
            <div
              key={intv.id}
              className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-xs hover:border-[#B86B45] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Icon + Title + Location + Reason */}
              <div className="flex items-start gap-4 max-w-2xl">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isWater
                      ? 'bg-[#B86B45]/10 text-[#B86B45] border-[#B86B45]/20'
                      : 'bg-[#C59A4A]/10 text-[#C59A4A] border-[#C59A4A]/20'
                  }`}
                >
                  {isWater ? <Droplets className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#252321] text-[#F5F1E8]">
                      {intv.id}
                    </span>
                    <StatusBadge status={intv.priority} type="priority" size="sm" />
                    <StatusBadge status={intv.status} size="sm" />
                  </div>

                  <h3 className="font-extrabold text-sm text-[#252321] mt-1">
                    {intv.title}
                  </h3>

                  <p className="text-xs text-[#6F6961]">{intv.target_location}</p>

                  <p className="text-xs text-[#252321] font-medium pt-1">
                    <span className="text-[#6F6961]">Trigger:</span> {intv.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#6F6961]">
                    <span>Resource: <b className="text-[#252321]">{intv.suggested_dispatch}</b></span>
                    <span>Dept: <b className="text-[#252321]">{intv.assigned_department}</b></span>
                    <span>Impact: <b className="text-[#8E9274] font-semibold">{intv.impact_metric}</b></span>
                  </div>
                </div>
              </div>

              {/* Right Column: ETA Timer + Status Actions */}
              <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-[#E7DED0] pt-3 md:pt-0 md:pl-5 space-y-3 shrink-0">
                {intv.status === 'DISPATCHED' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C59A4A]/10 border border-[#C59A4A]/30 rounded-xl text-xs font-bold text-[#A98245]">
                    <Timer className="w-4 h-4 text-[#C59A4A] animate-spin" />
                    <span>ETA: {intv.eta_minutes} mins</span>
                  </div>
                )}

                {intv.status === 'IN PROGRESS' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321]">
                    <CheckCircle2 className="w-4 h-4 text-[#8E9274]" />
                    <span>Active on Location</span>
                  </div>
                )}

                {intv.status === 'RESOLVED' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321]">
                    <CheckCircle2 className="w-4 h-4 text-[#8E9274]" />
                    <span>Mission Completed</span>
                  </div>
                )}

                {/* Status Transition Buttons */}
                <div className="flex items-center gap-1.5">
                  {intv.status === 'DISPATCHED' && (
                    <button
                      onClick={() => handleStatusUpdate(intv.id, 'IN PROGRESS')}
                      className="px-3 py-1.5 bg-[#B86B45] hover:bg-[#925238] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Confirm On Site
                    </button>
                  )}
                  {intv.status === 'IN PROGRESS' && (
                    <button
                      onClick={() => handleStatusUpdate(intv.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-[#252321] hover:bg-[#3E3935] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {intv.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusUpdate(intv.id, 'DISPATCHED')}
                      className="px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#EAE0D0] border border-[#E7DED0] text-[#6F6961] hover:text-[#252321] rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-[#252321]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F4] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E7DED0] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-[#252321]">
              Create Emergency Municipal Dispatch
            </h3>
            <p className="text-xs text-[#6F6961] mt-1">
              Deploy emergency cooling or water distribution fleet to a high-risk micro-grid
            </p>

            <form onSubmit={handleCreateDispatch} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#252321] mb-1">Target Zone ID</label>
                <input
                  type="text"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-mono text-xs text-[#252321] focus:outline-hidden focus:border-[#B86B45]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#252321] mb-1">Intervention Type</label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs text-[#252321] font-medium focus:outline-hidden focus:border-[#B86B45] cursor-pointer"
                >
                  <option value="Water Tanker">Water Tanker Fleet & Mist Cannons</option>
                  <option value="Cooling Center">Emergency Public Cooling Shelter</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#252321] mb-1">Target Location</label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs text-[#252321] focus:outline-hidden focus:border-[#B86B45]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#252321] mb-1">Resources Allocated</label>
                <input
                  type="text"
                  value={suggestedDispatch}
                  onChange={(e) => setSuggestedDispatch(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs text-[#252321] focus:outline-hidden focus:border-[#B86B45]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7DED0]">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-[#F5F1E8] text-[#6F6961] hover:text-[#252321] font-bold rounded-xl cursor-pointer border border-[#E7DED0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B86B45] hover:bg-[#925238] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

