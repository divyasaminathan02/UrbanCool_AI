import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { AlertItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  BellRing,
  Radio,
  Check,
  ShieldAlert
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { scenario } = useScenario();

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
          ? `Emergency Heat Warning Broadcasted to citizens in ward via SMS / IVR!`
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
            Public heat health advisories, outdoor worker alerts, and citizen SMS / IVR broadcasting
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

      {/* Filter Bar */}
      <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6F6961] uppercase tracking-wider text-[10px]">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-semibold text-[#252321] focus:outline-hidden focus:border-[#B86B45] cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="EXTREME">Extreme Heat Stress</option>
              <option value="VERY HIGH">Very High Risk</option>
              <option value="HIGH">High Risk</option>
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
              <option value="ACTIVE">Active</option>
              <option value="BROADCASTED">Broadcasted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-[#6F6961]">
          Total <b className="text-[#252321]">{alerts.length}</b> warning advisories generated
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-[#FBF9F4] border rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              alert.severity === 'EXTREME'
                ? 'border-[#9F4937]/40 bg-[#9F4937]/5'
                : 'border-[#E7DED0]'
            }`}
          >
            {/* Left Info */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#252321] text-[#F5F1E8]">
                  {alert.id}
                </span>
                <StatusBadge status={alert.severity} type="priority" size="sm" />
                <StatusBadge status={alert.status} size="sm" />
              </div>

              <h3 className="font-extrabold text-base text-[#252321]">
                {alert.headline}
              </h3>

              <p className="text-xs text-[#252321] leading-relaxed">
                {alert.message}
              </p>

              {/* Recommended Public Actions */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-[#6F6961] uppercase tracking-wider block">
                  Mandatory Public Directives:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#252321]">
                  {alert.recommended_actions.map((act, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#B86B45] shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#6F6961] pt-2 border-t border-[#E7DED0]">
                <span>Peak: <b className="text-[#9F4937]">{alert.peak_temp}°C</b></span>
                <span>Exposed Citizens: <b className="text-[#252321]">{alert.population_exposed.toLocaleString()}</b></span>
                <span>Ward: <b className="text-[#252321]">{alert.ward_name}</b></span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-[#E7DED0] pt-3 md:pt-0 md:pl-5">
              <button
                onClick={() => handleAlertStatus(alert.id, 'BROADCASTED')}
                className="px-4 py-2 bg-[#C9674B] hover:bg-[#9F4937] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Alert to Public</span>
              </button>

              <button
                onClick={() => handleAlertStatus(alert.id, 'ACKNOWLEDGED')}
                className="px-4 py-2 bg-[#F5F1E8] hover:bg-[#EAE0D0] border border-[#E7DED0] text-[#252321] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#8E9274]" />
                <span>Acknowledge</span>
              </button>

              <button
                onClick={() => handleAlertStatus(alert.id, 'RESOLVED')}
                className="px-4 py-2 bg-[#FBF9F4] hover:bg-[#F5F1E8] border border-[#E7DED0] text-[#6F6961] hover:text-[#252321] rounded-xl text-xs font-medium cursor-pointer"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

