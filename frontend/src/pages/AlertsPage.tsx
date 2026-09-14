import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { AlertItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { OfficerBanner } from '../components/common/OfficerBanner';
import {
  BellRing,
  Radio,
  Check,
  ShieldAlert,
  Send,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { scenario } = useScenario();
  const { role, officerInfo } = useAuth();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAlerts(scenario, selectedSeverity, selectedStatus);
      setAlerts(data);
    } catch (e) {
      console.error('Failed to load alerts', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [scenario, selectedSeverity, selectedStatus]);

  const handleAlertStatus = async (alertId: string, status: string) => {
    try {
      await apiService.updateAlertStatus(alertId, status);
      setBroadcastNotice(
        status === 'BROADCASTED'
          ? `Emergency Heat Warning Broadcasted by ${officerInfo.fullName} to citizens in ward via SMS / IVR!`
          : `Alert status updated to ${status}`
      );
      setTimeout(() => setBroadcastNotice(null), 3000);
      loadAlerts();
    } catch (e) {
      console.error('Failed to update alert', e);
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
              Municipal Heat Warning Broadcasts
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              Early Warning
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Public heat health advisories, outdoor worker alerts, and citizen SMS / IVR broadcasting for <span className="font-bold text-[#252321]">{officerInfo.department}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-[#C9674B]/10 border border-[#C9674B]/30 text-[#C9674B] rounded-xl flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#C9674B]" />
            <span>{alerts.filter((a) => a.status === 'ACTIVE').length} Active Warnings</span>
          </span>
        </div>
      </div>

      {broadcastNotice && (
        <div className="p-3.5 bg-[#8E9274]/15 border border-[#8E9274]/30 rounded-xl text-xs font-bold text-[#252321] flex items-center gap-2 animate-in fade-in">
          <Radio className="w-4 h-4 text-[#8E9274] animate-pulse" />
          <span>{broadcastNotice}</span>
        </div>
      )}

      {/* Role-Specific Protocol Directive Alert */}
      <div className="p-4 rounded-2xl border border-[#E7DED0] bg-[#F5F1E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#252321]">
            <ShieldAlert className="w-4 h-4 text-[#B86B45]" />
            <span>Active Operational Mandate: {officerInfo.primaryMandate}</span>
          </div>
          <p className="text-xs text-[#6F6961]">
            {role === 'HEAT_OFFICER'
              ? 'Authorized to trigger city-wide outdoor labor moratorium and initiate multi-ward cellular broadcast.'
              : role === 'PUBLIC_HEALTH'
              ? 'Authorized to notify primary health centers, dispatch emergency ORS kiosks, and ready ICU heatstroke protocols.'
              : role === 'WATER_OFFICER'
              ? 'Authorized to deploy high-pressure evaporative mist cannons and re-route emergency water tankers.'
              : 'Authorized to review environmental triggers and update municipal zoning protocols.'}
          </p>
        </div>
        <button
          onClick={() => {
            if (alerts.length > 0) handleAlertStatus(alerts[0].id, 'BROADCASTED');
          }}
          className="px-4 py-2 bg-[#9F4937] hover:bg-[#7D382A] text-white font-bold rounded-xl text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast All Alerts</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#F5F1E8] border border-[#E7DED0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#252321] focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="EXTREME">Extreme (&ge; 90 Risk)</option>
              <option value="VERY HIGH">Very High (80-89 Risk)</option>
              <option value="HIGH">High (60-79 Risk)</option>
              <option value="MODERATE">Moderate (40-59 Risk)</option>
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
              <option value="ACTIVE">Active</option>
              <option value="BROADCASTED">Broadcasted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#6F6961] font-medium">
          Showing <span className="font-bold text-[#252321]">{alerts.length}</span> alert bulletins
        </div>
      </div>

      {/* Alerts Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#B86B45] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-12 text-center">
          <BellRing className="w-12 h-12 text-[#A98245] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#252321]">No active warnings</h3>
          <p className="text-xs text-[#6F6961] mt-1">All micro-grids are operating within safe thermal thresholds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-[#FBF9F4] border border-[#E7DED0] hover:border-[#B86B45] rounded-2xl p-5 shadow-2xs space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7DED0] pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      alert.severity === 'EXTREME'
                        ? 'bg-[#9F4937] text-white'
                        : alert.severity === 'VERY HIGH'
                        ? 'bg-[#C9674B] text-white'
                        : 'bg-[#C59A4A] text-white'
                    }`}
                  >
                    {alert.severity} HEAT ALERT
                  </span>
                  <span className="text-xs font-mono font-bold text-[#6F6961]">{alert.id}</span>
                </div>
                <StatusBadge status={alert.status} />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#252321] tracking-tight">
                  {alert.headline}
                </h3>
                <p className="text-xs text-[#6F6961] leading-relaxed mt-1.5">{alert.message}</p>
              </div>

              {/* Advisory Checkpoints */}
              <div className="bg-[#F5F1E8] rounded-xl p-3.5 text-xs space-y-2">
                <span className="font-bold text-[#252321] block text-[11px] uppercase tracking-wider">
                  Mandatory Public Directives:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {alert.recommended_actions.map((act, aIdx) => (
                    <div key={aIdx} className="flex items-start gap-2 text-[#252321]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B86B45] mt-1.5 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-[11px] text-[#6F6961]">
                  <span>Peak: <strong className="text-[#9F4937]">{alert.peak_temp}°C</strong></span>
                  <span>Exposed: <strong className="text-[#252321]">{alert.population_exposed.toLocaleString()} citizens</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAlertStatus(alert.id, 'BROADCASTED')}
                      className="px-3.5 py-1.5 bg-[#9F4937] hover:bg-[#7D382A] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Broadcast SMS / IVR</span>
                    </button>
                  )}
                  {alert.status === 'BROADCASTED' && (
                    <button
                      onClick={() => handleAlertStatus(alert.id, 'ACKNOWLEDGED')}
                      className="px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#EAE2D5] text-[#252321] border border-[#E7DED0] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAlertStatus(alert.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-[#8E9274] hover:bg-[#686C50] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
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
