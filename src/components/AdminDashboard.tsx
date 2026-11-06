'use client';

import { useState, useEffect } from 'react';
import { Prize, WheelConfig } from '@/types';
import { calculateProbabilities } from '@/lib/weighted-random';
import { loadHistory, clearHistory, resetConfig } from '@/lib/storage';
import { defaultWheelConfig } from '@/lib/default-prizes';

interface AdminDashboardProps {
  config: WheelConfig;
  onConfigChange: (config: WheelConfig) => void;
}

export default function AdminDashboard({ config, onConfigChange }: AdminDashboardProps) {
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [history, setHistory] = useState<ReturnType<typeof loadHistory>>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'history' | 'stats'>('prizes');
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    name: '',
    color: '#FF6B6B',
    weight: 10,
    icon: '🎁',
    enabled: true,
  });

  const probabilities = calculateProbabilities(config.prizes);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const refreshHistory = () => {
    setHistory(loadHistory());
  };

  const addPrize = () => {
    if (!newPrize.name?.trim()) return;

    const prize: Prize = {
      id: Date.now().toString(),
      name: newPrize.name!.trim(),
      color: newPrize.color || '#FF6B6B',
      weight: newPrize.weight || 10,
      icon: newPrize.icon || '🎁',
      enabled: true,
    };

    onConfigChange({
      ...config,
      prizes: [...config.prizes, prize],
    });

    setNewPrize({
      name: '',
      color: '#FF6B6B',
      weight: 10,
      icon: '🎁',
      enabled: true,
    });
  };

  const updatePrize = (updatedPrize: Prize) => {
    onConfigChange({
      ...config,
      prizes: config.prizes.map(p => p.id === updatedPrize.id ? updatedPrize : p),
    });
    setEditingPrize(null);
  };

  const deletePrize = (id: string) => {
    onConfigChange({
      ...config,
      prizes: config.prizes.filter(p => p.id !== id),
    });
  };

  const togglePrize = (id: string) => {
    onConfigChange({
      ...config,
      prizes: config.prizes.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p),
    });
  };

  const handleClearHistory = () => {
    if (confirm('Hapus semua riwayat spin?')) {
      clearHistory();
      setHistory([]);
    }
  };

  // Stats calculations
  const stats = (() => {
    const totalSpins = history.length;
    const prizeCounts = new Map<string, number>();
    history.forEach(result => {
      const count = prizeCounts.get(result.prize.name) || 0;
      prizeCounts.set(result.prize.name, count + 1);
    });
    
    const mostWon = [...prizeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const leastWon = [...prizeCounts.entries()].sort((a, b) => a[1] - b[1])[0];

    return { totalSpins, prizeCounts, mostWon, leastWon };
  })();

  const emojiOptions = [
    '👕', '🪭', '🛍️', '📅', '🥤', '🎁', '⭐', '🔄',
    '📱', '🎧', '💳', '🎫', '🚚', '💎', '🏆', '🎮',
    '👑', '💰', '🎒', '☕', '🍕', '🎯', '🧸', '🎵'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(['prizes', 'history', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); if (tab === 'history') refreshHistory(); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'prizes' && '🎁 Hadiah'}
            {tab === 'history' && '📜 Riwayat'}
            {tab === 'stats' && '📊 Statistik'}
          </button>
        ))}
      </div>

      {/* Prizes Tab */}
      {activeTab === 'prizes' && (
        <div className="space-y-4">
          {/* Add New Prize Form */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-purple-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">➕ Tambah Hadiah Baru</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Hadiah</label>
                <input
                  type="text"
                  value={newPrize.name || ''}
                  onChange={e => setNewPrize({ ...newPrize, name: e.target.value })}
                  placeholder="Contoh: MacBook Pro"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bobot (Weight)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newPrize.weight ?? 10}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setNewPrize({ ...newPrize, weight: isNaN(val) ? 0 : val });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  💡 Bobot 1 = otomatis menjadi 0% setelah dimenangkan.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Warna</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={newPrize.color || '#FF6B6B'}
                    onChange={e => setNewPrize({ ...newPrize, color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={newPrize.color || '#FF6B6B'}
                    onChange={e => setNewPrize({ ...newPrize, color: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Icon</label>
                <div className="flex flex-wrap gap-1">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewPrize({ ...newPrize, icon: emoji })}
                      className={`w-8 h-8 rounded-md text-lg flex items-center justify-center transition-all ${
                        newPrize.icon === emoji 
                          ? 'bg-purple-100 ring-2 ring-purple-500 scale-110' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={addPrize}
              disabled={!newPrize.name?.trim()}
              className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tambah Hadiah
            </button>
          </div>

          {/* Prize List Header */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="text-sm font-bold text-gray-700">Daftar Hadiah ({config.prizes.length})</h4>
            <button
              onClick={() => {
                if (confirm('Kembalikan daftar hadiah ke default? (T-Shirt, Fan, Goodie Bag, Kalender, Tumbler, dll)')) {
                  const fresh = resetConfig();
                  onConfigChange(fresh);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
            >
              ↺ Reset ke Hadiah Default
            </button>
          </div>

          {/* Prize List */}
          <div className="space-y-2">
            {config.prizes.map((prize) => (
              <div 
                key={prize.id}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all ${
                  prize.enabled 
                    ? 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-sm' 
                    : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                {/* Color indicator */}
                <div 
                  className="w-4 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: prize.color }}
                />
                
                {/* Icon & Name */}
                <div className="flex-1 min-w-0">
                  {editingPrize?.id === prize.id ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={editingPrize.name}
                        onChange={e => setEditingPrize({ ...editingPrize, name: e.target.value })}
                        className="px-2 py-1 rounded border border-gray-300 text-sm text-gray-900"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingPrize.weight}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          setEditingPrize({ ...editingPrize, weight: isNaN(val) ? 0 : val });
                        }}
                        className="px-2 py-1 rounded border border-gray-300 text-sm text-gray-900"
                      />
                      <input
                        type="color"
                        value={editingPrize.color}
                        onChange={e => setEditingPrize({ ...editingPrize, color: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => updatePrize(editingPrize)}
                          className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm font-medium"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingPrize(null)}
                          className="flex-1 px-3 py-1 bg-gray-400 text-white rounded text-sm font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl flex-shrink-0">{prize.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{prize.name}</p>
                          {prize.weight === 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              ⭐ 1x Menang
                            </span>
                          )}
                          {prize.weight === 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                              🚫 Peluang 0%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Bobot: {prize.weight} · Peluang: {(probabilities.get(prize.id) || 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Probability bar */}
                {editingPrize?.id !== prize.id && (
                  <div className="hidden sm:block w-24 flex-shrink-0">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${probabilities.get(prize.id) || 0}%`,
                          backgroundColor: prize.color 
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                {editingPrize?.id !== prize.id && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePrize(prize.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        prize.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={prize.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {prize.enabled ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button
                      onClick={() => setEditingPrize({ ...prize })}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deletePrize(prize.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Wheel Settings */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Pengaturan Wheel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Durasi Spin (ms)</label>
                <input
                  type="number"
                  min="2000"
                  max="15000"
                  step="500"
                  value={config.spinDuration}
                  onChange={e => onConfigChange({ ...config, spinDuration: parseInt(e.target.value) || 5000 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Minimum Putaran</label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={config.minRotations}
                  onChange={e => onConfigChange({ ...config, minRotations: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{history.length} spin tercatat</p>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
              >
                🗑️ Hapus Semua
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📜</p>
              <p>Belum ada riwayat spin</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {history.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: result.prize.color + '20' }}
                  >
                    {result.prize.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{result.prize.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(result.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="text-xs text-gray-300 font-mono">{result.spinId.slice(-6)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-700">{stats.totalSpins}</p>
              <p className="text-sm text-purple-600 mt-1">Total Spin</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
              <p className="text-lg font-bold text-green-700 truncate">{stats.mostWon?.[0] || '-'}</p>
              <p className="text-sm text-green-600 mt-1">Paling Sering ({stats.mostWon?.[1] || 0}x)</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center">
              <p className="text-lg font-bold text-orange-700 truncate">{stats.leastWon?.[0] || '-'}</p>
              <p className="text-sm text-orange-600 mt-1">Paling Jarang ({stats.leastWon?.[1] || 0}x)</p>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Distribusi Hasil</h3>
            {stats.totalSpins === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {[...stats.prizeCounts.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => {
                    const percentage = (count / stats.totalSpins) * 100;
                    const prize = config.prizes.find(p => p.name === name);
                    return (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-lg w-8">{prize?.icon || '🎁'}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{name}</span>
                            <span className="text-gray-500">{count}x ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full transition-all duration-700"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: prize?.color || '#999'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Probability vs Actual */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Peluang vs Aktual</h3>
            {stats.totalSpins === 0 ? (
              <p className="text-center text-gray-400 py-8">Spin beberapa kali untuk melihat perbandingan</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">Hadiah</th>
                      <th className="text-right py-2 text-gray-600 font-medium">Peluang (%)</th>
                      <th className="text-right py-2 text-gray-600 font-medium">Aktual (%)</th>
                      <th className="text-right py-2 text-gray-600 font-medium">Selisih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.prizes.filter(p => p.enabled).map(prize => {
                      const expected = probabilities.get(prize.id) || 0;
                      const actual = stats.totalSpins > 0 
                        ? ((stats.prizeCounts.get(prize.name) || 0) / stats.totalSpins) * 100 
                        : 0;
                      const diff = actual - expected;
                      return (
                        <tr key={prize.id} className="border-b border-gray-50">
                          <td className="py-2 text-gray-900">{prize.icon} {prize.name}</td>
                          <td className="text-right py-2 text-gray-600">{expected.toFixed(1)}</td>
                          <td className="text-right py-2 text-gray-600">{actual.toFixed(1)}</td>
                          <td className={`text-right py-2 font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
