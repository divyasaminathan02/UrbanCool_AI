import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScenario } from '../context/ScenarioContext';
import { UserRole, ScenarioType } from '../types';
import {
  Settings,
  Sliders,
  Bell,
  Shield,
  User,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const { scenario, setScenario } = useScenario();

  // Settings form states
  const [extremeThreshold, setExtremeThreshold] = useState(90);
  const [veryHighThreshold, setVeryHighThreshold] = useState(80);
  const [highThreshold, setHighThreshold] = useState(60);

  const [tempWeight, setTempWeight] = useState(45);
  const [canopyWeight, setCanopyWeight] = useState(30);
  const [popWeight, setPopWeight] = useState(25);

  const [smsWebhook, setSmsWebhook] = useState('https://alerts.punecorporation.org/v1/sms-broadcast');
  const [tankerDispatchAuto, setTankerDispatchAuto] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setExtremeThreshold(90);
    setVeryHighThreshold(80);
    setHighThreshold(60);
    setTempWeight(45);
    setCanopyWeight(30);
    setPopWeight(25);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#12263A] tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#18B6A4]" />
            <span>System & Municipal Advisory Settings</span>
          </h1>
          <p className="text-xs text-[#617080] mt-0.5">
            Configure thermal thresholds, multi-criteria risk weightings, and simulated broadcast webhooks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configurations Saved!</span>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds Card */}
        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#DCE4E8] pb-3">
            <h2 className="text-sm font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#18B6A4]" />
              Heat Risk Classification Thresholds (0–100 Scale)
            </h2>
            <p className="text-xs text-[#617080] mt-0.5">
              Set trigger levels for automated municipal advisory dispatches
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#D9534F] uppercase tracking-wider mb-1">
                Extreme Risk Cutoff
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="80"
                  max="98"
                  value={extremeThreshold}
                  onChange={(e) => setExtremeThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl font-mono font-bold text-sm"
                />
                <span className="text-[#617080] font-bold">/ 100</span>
              </div>
              <span className="text-[10px] text-[#617080] mt-1 block">Triggers instant water tanker fleet</span>
            </div>

            <div>
              <label className="block font-bold text-[#C9543C] uppercase tracking-wider mb-1">
                Very High Risk Cutoff
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="70"
                  max="89"
                  value={veryHighThreshold}
                  onChange={(e) => setVeryHighThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl font-mono font-bold text-sm"
                />
                <span className="text-[#617080] font-bold">/ 100</span>
              </div>
              <span className="text-[10px] text-[#617080] mt-1 block">Triggers cooling shelter activations</span>
            </div>

            <div>
              <label className="block font-bold text-[#B88114] uppercase tracking-wider mb-1">
                High Risk Cutoff
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="79"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl font-mono font-bold text-sm"
                />
                <span className="text-[#617080] font-bold">/ 100</span>
              </div>
              <span className="text-[10px] text-[#617080] mt-1 block">Triggers targeted worker SMS</span>
            </div>
          </div>
        </div>

        {/* Multi-Criteria Weightings */}
        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#DCE4E8] pb-3">
            <h2 className="text-sm font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#18B6A4]" />
              Multi-Criteria Risk Score Formulation Weights
            </h2>
            <p className="text-xs text-[#617080] mt-0.5">
              Weighting proportions for temperature intensity, environmental canopy, and population exposure (Total = 100%)
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Thermal Intensity & Anomaly Factor</span>
                <span className="font-mono font-bold">{tempWeight}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={tempWeight}
                onChange={(e) => setTempWeight(Number(e.target.value))}
                className="w-full accent-[#18B6A4] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Vegetation & Built-up Land Cover Factor (NDVI / Built Ratio)</span>
                <span className="font-mono font-bold">{canopyWeight}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={canopyWeight}
                onChange={(e) => setCanopyWeight(Number(e.target.value))}
                className="w-full accent-[#18B6A4] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Human Exposure & Vulnerable Demographics</span>
                <span className="font-mono font-bold">{popWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={popWeight}
                onChange={(e) => setPopWeight(Number(e.target.value))}
                className="w-full accent-[#18B6A4] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Operations & Dispatch Settings */}
        <div className="bg-white border border-[#DCE4E8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#DCE4E8] pb-3">
            <h2 className="text-sm font-bold text-[#12263A] uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#18B6A4]" />
              Broadcast & Emergency Dispatch Integration
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#172033] mb-1">
                Citizen Heat Warning Webhook Target (Simulated)
              </label>
              <input
                type="url"
                value={smsWebhook}
                onChange={(e) => setSmsWebhook(e.target.value)}
                className="w-full p-2.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl font-mono text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="autoTanker"
                checked={tankerDispatchAuto}
                onChange={(e) => setTankerDispatchAuto(e.target.checked)}
                className="w-4 h-4 accent-[#18B6A4] rounded cursor-pointer"
              />
              <label htmlFor="autoTanker" className="font-medium text-[#172033] cursor-pointer">
                Auto-generate water tanker dispatches for grid cells reaching Extreme (&ge; 90) risk
              </label>
            </div>
          </div>
        </div>

        {/* Save / Reset Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-[#F4F7F8] hover:bg-[#EAEFF2] text-[#617080] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#12263A] hover:bg-[#1B344D] text-white font-bold text-xs rounded-xl shadow-md shadow-[#12263A]/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#18B6A4]" />
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
