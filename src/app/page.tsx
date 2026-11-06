'use client';

import { useState, useEffect, useCallback } from 'react';
import { WheelConfig, Prize } from '@/types';
import { loadConfig, saveConfig } from '@/lib/storage';
import SpinWheel from '@/components/SpinWheel';
import AdminDashboard from '@/components/AdminDashboard';

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-300"
      style={{ transform: open ? 'rotate(90deg)' : 'none' }}
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </>
      )}
    </svg>
  );
}

export default function Home() {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [lastWin, setLastWin] = useState<Prize | null>(null);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const handleConfigChange = useCallback((newConfig: WheelConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  }, []);

  const handleSpinComplete = useCallback((prize: Prize) => {
    setLastWin(prize);

    // For items with a weight of 1, automatically set their probability to 0 after they are won
    if (prize.weight === 1) {
      setConfig((prevConfig) => {
        if (!prevConfig) return prevConfig;
        const updatedPrizes = prevConfig.prizes.map((p) =>
          p.id === prize.id ? { ...p, weight: 0 } : p
        );
        const updatedConfig = { ...prevConfig, prizes: updatedPrizes };
        saveConfig(updatedConfig);
        return updatedConfig;
      });
    }
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-sky-950 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent shadow-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2744] via-[#0b1d33] to-[#060e1a] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Rich Ambient Blue Gradient Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 tracking-tight">
            <span className="text-2xl sm:text-3xl filter drop-shadow-md">🎡</span>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
              Spin & Win
            </span>
          </h1>
          <p className="text-sky-300/70 text-xs sm:text-sm mt-0.5 font-medium tracking-wide">
            Putar roda keberuntungan dan menangkan hadiah menarik!
          </p>
        </div>

        {/* Menu Icon Button */}
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className={`
            w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200
            ${showAdmin
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105 font-bold'
              : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 shadow-md shadow-black/20 active:scale-95'
            }
          `}
          aria-label={showAdmin ? 'Tutup Pengaturan' : 'Buka Pengaturan Admin'}
          title={showAdmin ? 'Tutup Pengaturan' : 'Pengaturan Admin'}
        >
          <MenuIcon open={showAdmin} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center px-4 pb-8 flex-1 justify-center">
        {!showAdmin ? (
          <div className="flex flex-col items-center w-full max-w-xl">
            {/* Perfectly Symmetrical Spinning Wheel */}
            <div className="my-2 sm:my-4">
              <SpinWheel
                config={config}
                onSpinComplete={handleSpinComplete}
                onConfigChange={handleConfigChange}
              />
            </div>

            {/* Prize Quick Overview */}
            <div className="mt-8 w-full max-w-md">
              <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl shadow-black/25 p-4 sm:p-5">
                <h3 className="text-sky-200 font-bold mb-3 text-xs sm:text-sm tracking-wide uppercase flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Daftar Hadiah</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {config.prizes.filter(p => p.enabled).map(prize => {
                    const isZeroChance = prize.weight === 0;
                    return (
                      <div
                        key={prize.id}
                        className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 border transition-colors text-xs font-semibold ${
                          isZeroChance
                            ? 'bg-white/[0.02] border-white/5 text-white/35 line-through decoration-rose-400/50'
                            : 'bg-white/[0.06] hover:bg-white/[0.1] border-white/10 text-white/90'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base flex-shrink-0 no-underline">{prize.icon}</span>
                          <span className="truncate">{prize.name}</span>
                        </div>
                        {isZeroChance && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0 no-underline">
                            0% Habis
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl my-4 animate-in fade-in duration-300">
            <div className="bg-white/95 backdrop-blur-xl text-slate-800 rounded-3xl shadow-2xl shadow-black/40 border border-white/20 p-4 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Dashboard Admin</span>
                </h2>
                <button
                  onClick={() => setShowAdmin(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                >
                  Kembali ke Wheel
                </button>
              </div>
              <AdminDashboard config={config} onConfigChange={handleConfigChange} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-sky-400/40 text-xs font-medium">
        Spin Wheel &copy; {new Date().getFullYear()} · Built by Alvisyha.
      </footer>
    </div>
  );
}
