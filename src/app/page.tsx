'use client';

import { useState, useEffect, useCallback } from 'react';
import { WheelConfig, Prize } from '@/types';
import { loadConfig, saveConfig } from '@/lib/storage';
import SpinWheel from '@/components/SpinWheel';
import AdminDashboard from '@/components/AdminDashboard';

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
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        {/* Stars */}
        {typeof window !== 'undefined' && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            🎡 <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">Spin & Win</span>
          </h1>
          <p className="text-purple-300/80 text-sm mt-0.5">Putar roda keberuntungan!</p>
        </div>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            showAdmin 
              ? 'bg-white text-purple-700 shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
          }`}
        >
          {showAdmin ? '🎡 Wheel' : '⚙️ Admin'}
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center px-4 pb-8">
        {!showAdmin ? (
          <>
            <div className="mt-4 sm:mt-8">
              <SpinWheel config={config} onSpinComplete={handleSpinComplete} />
            </div>

            {/* Info section */}
            <div className="mt-8 w-full max-w-md">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
                <h3 className="text-white/90 font-semibold mb-3 text-sm">🎯 Daftar Hadiah</h3>
                <div className="grid grid-cols-2 gap-2">
                  {config.prizes.filter(p => p.enabled).map(prize => (
                    <div key={prize.id} className="flex items-center gap-2 text-white/70 text-xs bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-base">{prize.icon}</span>
                      <span className="truncate">{prize.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full max-w-4xl mt-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ Dashboard Admin</h2>
              <AdminDashboard config={config} onConfigChange={handleConfigChange} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-purple-400/50 text-xs">
        Spin Wheel &copy; {new Date().getFullYear()} · Built with Next.js
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
