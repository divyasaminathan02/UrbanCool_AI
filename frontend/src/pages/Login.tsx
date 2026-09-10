import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  ShieldCheck,
  Building2,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('heat_officer');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);

  const demoPersonas = [
    {
      username: 'heat_officer',
      label: 'Heat Action Officer',
      desc: 'Municipal Heat Action & Disaster Response Lead',
    },
    {
      username: 'water_officer',
      label: 'Water Logistics Officer',
      desc: 'Water Tanker & Hydration Fleet Operations',
    },
    {
      username: 'urban_planner',
      label: 'Urban Planner',
      desc: 'Canopy Deficit & Cool Roof Strategy',
    },
    {
      username: 'health_officer',
      label: 'Public Health Officer',
      desc: 'Cooling Centers & Hospital Emergency Surge',
    },
    {
      username: 'admin',
      label: 'System Admin',
      desc: 'Central Command & Sensor Infrastructure',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleSelectPersona = (u: string) => {
    setUsername(u);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-between text-[#252321] p-6 relative overflow-hidden">
      {/* Background Subtle Grain / Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#B86B45_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B86B45] to-[#925238] flex items-center justify-center shadow-md shadow-[#B86B45]/20">
            <Layers className="w-5 h-5 text-[#FBF9F4]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#252321] tracking-tight">
              UrbanCool <span className="text-[#B86B45]">AI</span>
            </h1>
            <p className="text-xs text-[#6F6961]">Climate Intelligence for Urban Decisions</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-[#FBF9F4] border border-[#E7DED0] rounded-xl text-[#B86B45] shadow-2xs">
          <Building2 className="w-4 h-4" />
          <span>PCCOE Indradhanu Grand Challenge 2026</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10 my-8">
        {/* Left Story Column */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C59A4A]/15 border border-[#C59A4A]/35 rounded-full text-xs font-bold text-[#8E6A26]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B86B45]" />
            <span>UN SDG 13 • 11 • 3 Aligned</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252321] tracking-tight leading-tight">
            Hyper-Local Heat Intelligence for Resilient Cities.
          </h2>

          <p className="text-sm text-[#6F6961] leading-relaxed">
            Downscaling synoptic weather forecasts to 250m micro-grids using satellite LST, vegetation indices, elevation, and population exposure to drive proactive municipal heat action.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-[#252321] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#B86B45] shrink-0" />
              <span>Real-time microclimate thermal anomaly downscaling</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#252321] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#B86B45] shrink-0" />
              <span>Deterministic municipal water & cooling center dispatch</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#252321] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#B86B45] shrink-0" />
              <span>Explainable AI feature contribution drivers</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="bg-[#FBF9F4] rounded-3xl p-6 sm:p-8 text-[#252321] shadow-xl border border-[#E7DED0]">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-[#252321]">Municipal Sign In</h3>
            <p className="text-xs text-[#6F6961] mt-1">
              Select a pre-seeded persona or enter credentials
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#9F4937]/10 border border-[#9F4937]/30 text-xs text-[#9F4937] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#252321] uppercase tracking-wider mb-1.5">
                Username / Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F6961]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs font-semibold text-[#252321] focus:outline-hidden focus:border-[#B86B45] focus:ring-1 focus:ring-[#B86B45]"
                  placeholder="e.g. heat_officer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#252321] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F6961]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs font-semibold text-[#252321] focus:outline-hidden focus:border-[#B86B45] focus:ring-1 focus:ring-[#B86B45]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Quick Persona Picker */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold text-[#6F6961] uppercase tracking-wider mb-2">
                Quick Demo Persona:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {demoPersonas.slice(0, 4).map((p) => (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => handleSelectPersona(p.username)}
                    className={`text-left p-2.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      username === p.username
                        ? 'bg-[#B86B45]/15 border-[#B86B45] font-bold text-[#252321]'
                        : 'bg-[#F5F1E8] border-[#E7DED0] text-[#6F6961] hover:bg-[#EAE2D5]'
                    }`}
                  >
                    <div className="font-bold">{p.label}</div>
                    <div className="text-[9px] opacity-75 truncate">{p.username}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 bg-[#B86B45] hover:bg-[#925238] text-[#FBF9F4] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#B86B45]/20 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Access Command Center'}</span>
              <ArrowRight className="w-4 h-4 text-[#FBF9F4]" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between text-[11px] text-[#6F6961] border-t border-[#E7DED0] pt-4 z-10">
        <div>UrbanCool AI — Pune Municipal Climate Intelligence System</div>
        <div>Built for Indradhanu Grand Challenge 2026</div>
      </div>
    </div>
  );
};
