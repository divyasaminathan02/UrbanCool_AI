import React, { useState, useEffect } from 'react';
import { useScenario } from '../context/ScenarioContext';
import { apiService } from '../services/api';
import { AlertItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  BellRing,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Users,
  Thermometer,
  Send,
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
          <h1 className="text-2xl font-black text-[#12263A] tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-[#D9534F]" />
            <span>Municipal Heat Warning Broadcasts</span>
          </h1>
          <p className="text-xs text-[#617080] mt-0.5">
            Public heat health advisories, outdoor worker alerts, and citizen SMS / IVR broadcasting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
            <span>{alerts.filter((a) => a.status === 'ACTIVE').length} Active Warnings</span>
          </span>
        </div>
      </div>

      {broadcastNotice && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 flex items-center gap-2 animate-in fade-in">
          <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>{broadcastNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-[#DCE4E8] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#617080] uppercase tracking-wider text-[11px]">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl font-medium text-[#172033] focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="EXTREME">Extreme Heat Stress</option>
              <option value="VERY HIGH">Very High Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#617080] uppercase tracking-wider text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl font-medium text-[#172033] focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BROADCASTED">Broadcasted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-[#617080]">
          Total <b className="text-[#172033]">{alerts.length}</b> warning advisories generated
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              alert.severity === 'EXTREME'
                ? 'border-red-300 bg-red-50/10'
                : 'border-[#DCE4E8]'
            }`}
          >
            {/* Left Info */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#12263A] text-white">
                  {alert.id}
                </span>
                <StatusBadge status={alert.severity} type="priority" size="sm" />
                <StatusBadge status={alert.status} size="sm" />
              </div>

              <h3 className="font-extrabold text-base text-[#12263A]">
                {alert.headline}
              </h3>

              <p className="text-xs text-[#172033] leading-relaxed">
                {alert.message}
              </p>

              {/* Recommended Public Actions */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-[#617080] uppercase tracking-wider block">
                  Mandatory Public Directives:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#172033]">
                  {alert.recommended_actions.map((act, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#0D8F82] shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#617080] pt-2 border-t border-[#DCE4E8]/60">
                <span>Peak: <b className="text-[#D9534F]">{alert.peak_temp}°C</b></span>
                <span>Exposed Citizens: <b className="text-[#172033]">{alert.population_exposed.toLocaleString()}</b></span>
                <span>Ward: <b className="text-[#172033]">{alert.ward_name}</b></span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-[#DCE4E8] pt-3 md:pt-0 md:pl-5">
              <button
                onClick={() => handleAlertStatus(alert.id, 'BROADCASTED')}
                className="px-4 py-2 bg-[#D9534F] hover:bg-[#B83E26] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Alert to Public</span>
              </button>

              <button
                onClick={() => handleAlertStatus(alert.id, 'ACKNOWLEDGED')}
                className="px-4 py-2 bg-[#F4F7F8] hover:bg-[#EAEFF2] border border-[#DCE4E8] text-[#12263A] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#0D8F82]" />
                <span>Acknowledge</span>
              </button>

              <button
                onClick={() => handleAlertStatus(alert.id, 'RESOLVED')}
                className="px-4 py-2 bg-white hover:bg-[#F4F7F8] border border-[#DCE4E8] text-[#617080] rounded-xl text-xs font-medium cursor-pointer"
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
