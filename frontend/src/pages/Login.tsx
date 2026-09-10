import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Flame,
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

  const demoPersonas: Array<{ username: string; label: string; role: string; desc: string }> = [
    {
      username: 'heat_officer',
      label: 'Heat Action Officer',
      role: 'HEAT_OFFICER',
      desc: 'Municipal Heat Action & Disaster Response Lead',
    },
    {
      username: 'water_officer',
      label: 'Water Logistics Officer',
      role: 'WATER_OFFICER',
      desc: 'Water Tanker & Hydration Fleet Operations',
    },
    {
      username: 'urban_planner',
      label: 'Urban Planner',
      role: 'PLANNER',
      desc: 'Canopy Deficit & Cool Roof Strategy',
    },
    {
      username: 'health_officer',
      label: 'Public Health Officer',
      role: 'PUBLIC_HEALTH',
      desc: 'Cooling Centers & Hospital Emergency Surge',
    },
    {
      username: 'admin',
      label: 'System Admin',
      role: 'ADMIN',
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
    <div className="min-h-screen bg-[#12263A] flex flex-col justify-between text-white p-6 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#18B6A4_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18B6A4] to-[#0D8F82] flex items-center justify-center shadow-lg shadow-[#18B6A4]/25">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              UrbanCool <span className="text-[#18B6A4]">AI</span>
            </h1>
            <p className="text-xs text-[#9AAEB9]">Urban Climate Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-[#1B344D] border border-[#2B4968] rounded-xl text-[#18B6A4]">
          <Building2 className="w-4 h-4" />
          <span>PCCOE Indradhanu Grand Challenge 2026</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10 my-8">
        {/* Left Story Column */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18B6A4]/15 border border-[#18B6A4]/30 rounded-full text-xs font-bold text-[#18B6A4]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>UN SDG 13 • 11 • 3 Aligned</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Hyper-Local Heat Intelligence for Resilient Cities.
          </h2>

          <p className="text-sm text-[#A4B8C6] leading-relaxed">
            Downscaling synoptic weather forecasts to 250m micro-grids using satellite LST, vegetation indices, elevation, and population exposure to drive proactive municipal heat action.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-[#C5D3DC]">
              <CheckCircle2 className="w-4 h-4 text-[#18B6A4] shrink-0" />
              <span>Real-time microclimate thermal anomaly downscaling</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#C5D3DC]">
              <CheckCircle2 className="w-4 h-4 text-[#18B6A4] shrink-0" />
              <span>Deterministic municipal water & cooling center dispatch</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#C5D3DC]">
              <CheckCircle2 className="w-4 h-4 text-[#18B6A4] shrink-0" />
              <span>Explainable AI feature contribution drivers</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-[#172033] shadow-2xl border border-[#DCE4E8]">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-[#12263A]">Municipal Sign In</h3>
            <p className="text-xs text-[#617080] mt-1">
              Select a pre-seeded persona or enter credentials
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D9534F] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Username / Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#617080]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl text-xs font-medium text-[#172033] focus:outline-hidden focus:border-[#18B6A4] focus:ring-1 focus:ring-[#18B6A4]"
                  placeholder="e.g. heat_officer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#617080]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl text-xs font-medium text-[#172033] focus:outline-hidden focus:border-[#18B6A4] focus:ring-1 focus:ring-[#18B6A4]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Quick Persona Picker */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold text-[#617080] uppercase tracking-wider mb-2">
                Quick Demo Persona:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {demoPersonas.slice(0, 4).map((p) => (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => handleSelectPersona(p.username)}
                    className={`text-left p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      username === p.username
                        ? 'bg-[#18B6A4]/15 border-[#18B6A4] font-bold text-[#12263A]'
                        : 'bg-[#F4F7F8] border-[#DCE4E8] text-[#617080] hover:bg-[#EAEFF2]'
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[9px] opacity-80 truncate">{p.username}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 bg-[#12263A] hover:bg-[#1B344D] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#12263A]/20 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Access Command Center'}</span>
              <ArrowRight className="w-4 h-4 text-[#18B6A4]" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between text-[11px] text-[#617080] border-t border-[#1B344D] pt-4 z-10">
        <div>UrbanCool AI — Pune Municipal Climate Intelligence System</div>
        <div>Built for Indradhanu Grand Challenge 2026</div>
      </div>
    </div>
  );
};
