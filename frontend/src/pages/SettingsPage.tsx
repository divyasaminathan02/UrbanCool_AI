import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScenario } from '../context/ScenarioContext';
import {
  Settings,
  Sliders,
  Bell,
  Shield,
  CheckCircle2,
  Save,
  RotateCcw
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#252321] tracking-tight">
              System & Municipal Advisory Settings
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B86B45]/10 text-[#B86B45] border border-[#B86B45]/25 rounded-md uppercase tracking-wider">
              Control Center
            </span>
          </div>
          <p className="text-xs text-[#6F6961] mt-0.5">
            Configure thermal thresholds, multi-criteria risk weightings, and simulated broadcast webhooks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-[#252321] bg-[#8E9274]/15 px-3 py-1.5 rounded-xl border border-[#8E9274]/30 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#8E9274]" />
              <span>Configurations Saved!</span>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds Card */}
        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E7DED0] pb-3">
            <h2 className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#B86B45]" />
              Heat Risk Classification Thresholds (0–100 Scale)
            </h2>
            <p className="text-xs text-[#6F6961] mt-0.5">
              Set trigger levels for automated municipal advisory dispatches
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#9F4937] uppercase tracking-wider mb-1">
                Extreme Risk Cutoff
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="80"
                  max="98"
                  value={extremeThreshold}
                  onChange={(e) => setExtremeThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-mono font-bold text-sm text-[#252321] focus:outline-hidden focus:border-[#B86B45]"
                />
                <span className="text-[#6F6961] font-bold">/ 100</span>
              </div>
              <span className="text-[10px] text-[#6F6961] mt-1 block">Triggers instant water tanker fleet</span>
            </div>

            <div>
              <label className="block font-bold text-[#C9674B] uppercase tracking-wider mb-1">
                Very High Risk Cutoff
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="70"
                  max="89"
                  value={veryHighThreshold}
                  onChange={(e) => setVeryHighThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-mono font-bold text-sm text-[#252321] focus:outline-hidden focus:border-[#B86B45]"
                />
                <span className="text-[#6F6961] font-bold">/ 100</span>
              </div>
              <span className="text-[10px] text-[#6F6961] mt-1 block">Triggers cooling shelter activations</span>
            </div>

            <div>
              <label className="block font-bold text-[#C59A4A] uppercase tracking-wider mb-1">
                High Risk Cutoff
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="79"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-mono font-bold text-sm text-[#252321] focus:outline-hidden focus:border-[#B86B45]"
                />
                <span className="text-[#6F6961] font-bold">/ 100</span>
              </div>
              <span className="text-[10px] text-[#6F6961] mt-1 block">Triggers targeted worker SMS</span>
            </div>
          </div>
        </div>

        {/* Multi-Criteria Weightings */}
        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E7DED0] pb-3">
            <h2 className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B86B45]" />
              Multi-Criteria Risk Score Formulation Weights
            </h2>
            <p className="text-xs text-[#6F6961] mt-0.5">
              Weighting proportions for temperature intensity, environmental canopy, and population exposure (Total = 100%)
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-[#252321]">Thermal Intensity & Anomaly Factor</span>
                <span className="font-mono font-bold text-[#B86B45]">{tempWeight}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={tempWeight}
                onChange={(e) => setTempWeight(Number(e.target.value))}
                className="w-full accent-[#B86B45] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-[#252321]">Vegetation & Built-up Land Cover Factor (NDVI / Built Ratio)</span>
                <span className="font-mono font-bold text-[#B86B45]">{canopyWeight}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={canopyWeight}
                onChange={(e) => setCanopyWeight(Number(e.target.value))}
                className="w-full accent-[#B86B45] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-[#252321]">Human Exposure & Vulnerable Demographics</span>
                <span className="font-mono font-bold text-[#B86B45]">{popWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={popWeight}
                onChange={(e) => setPopWeight(Number(e.target.value))}
                className="w-full accent-[#B86B45] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Operations & Dispatch Settings */}
        <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E7DED0] pb-3">
            <h2 className="text-xs font-bold text-[#252321] uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#B86B45]" />
              Broadcast & Emergency Dispatch Integration
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#252321] mb-1">
                Citizen Heat Warning Webhook Target (Simulated)
              </label>
              <input
                type="url"
                value={smsWebhook}
                onChange={(e) => setSmsWebhook(e.target.value)}
                className="w-full p-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl font-mono text-xs text-[#252321] focus:outline-hidden focus:border-[#B86B45]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="autoTanker"
                checked={tankerDispatchAuto}
                onChange={(e) => setTankerDispatchAuto(e.target.checked)}
                className="w-4 h-4 accent-[#B86B45] rounded cursor-pointer"
              />
              <label htmlFor="autoTanker" className="font-medium text-[#252321] cursor-pointer">
                Auto-generate water tanker dispatches for grid cells reaching Extreme (≥ 90) risk
              </label>
            </div>
          </div>
        </div>

        {/* Save / Reset Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-[#F5F1E8] hover:bg-[#EAE0D0] text-[#6F6961] hover:text-[#252321] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E7DED0]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#B86B45] hover:bg-[#925238] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#F5F1E8]" />
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};

