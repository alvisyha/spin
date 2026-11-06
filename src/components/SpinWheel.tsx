'use client';

import { useState, useRef, useCallback } from 'react';
import { Prize, WheelConfig } from '@/types';
import {
  weightedRandom,
  calculateNextRotation,
  getPrizeAtRotation,
  generateSpinId
} from '@/lib/weighted-random';
import { saveSpinResult, saveConfig } from '@/lib/storage';

interface SpinWheelProps {
  config: WheelConfig;
  onSpinComplete?: (prize: Prize) => void;
  onConfigChange?: (config: WheelConfig) => void;
}

/**
 * Determine contrast text color (black or white) based on background hex
 */
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 160 ? '#0f172a' : '#ffffff';
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 160 ? '#0f172a' : '#ffffff';
  }
  return '#ffffff';
}

/**
 * Split long labels into two balanced lines
 */
function splitLabel(name: string): [string, string?] {
  const trimmed = name.trim();
  if (trimmed.length <= 11) {
    return [trimmed];
  }
  const words = trimmed.split(' ');
  if (words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    return [line1, line2];
  }
  return [trimmed.substring(0, 10) + '…'];
}

export default function SpinWheel({ config, onSpinComplete, onConfigChange }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [wasOneShotPrize, setWasOneShotPrize] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const enabledPrizes = config.prizes.filter((p) => p.enabled);
  const activePrizes = enabledPrizes.filter((p) => p.weight > 0);
  const numSegments = enabledPrizes.length;

  const spin = useCallback(() => {
    if (isSpinning || enabledPrizes.length < 2 || activePrizes.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);
    setWasOneShotPrize(false);

    // 1. Pick winner using the weighted random algorithm (respects configured chances)
    const winner = weightedRandom(config.prizes);

    // 2. Calculate next rotation from current rotation so it lands exactly under the pointer
    const nextRotation = calculateNextRotation(
      rotation,
      config.prizes,
      winner,
      config.minRotations
    );
    setRotation(nextRotation);

    // 3. Reveal result right after the spin animation completes
    setTimeout(() => {
      // Determine the exact prize segment directly under the pointer
      const landedPrize = getPrizeAtRotation(nextRotation, config.prizes) || winner;
      const isOneShot = landedPrize.weight === 1;

      setIsSpinning(false);
      setSelectedPrize(landedPrize);
      setWasOneShotPrize(isOneShot);
      setShowResult(true);

      saveSpinResult({
        prize: landedPrize,
        timestamp: new Date(),
        spinId: generateSpinId(),
      });

      // For items with a weight of 1, automatically set their probability to 0 after they are won
      if (isOneShot) {
        const updatedPrizes = config.prizes.map((p) =>
          p.id === landedPrize.id ? { ...p, weight: 0 } : p
        );
        const updatedConfig = { ...config, prizes: updatedPrizes };
        onConfigChange?.(updatedConfig);
        saveConfig(updatedConfig);
      }

      onSpinComplete?.(landedPrize);
    }, config.spinDuration + 150);
  }, [isSpinning, enabledPrizes, activePrizes, config, rotation, onConfigChange, onSpinComplete]);

  const closeResult = () => {
    setShowResult(false);
  };

  if (enabledPrizes.length < 2) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center bg-white/80 border border-sky-200 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
          <p className="text-amber-600 text-lg font-bold">⚠️ Minimal 2 hadiah aktif diperlukan</p>
          <p className="text-slate-500 text-sm mt-2">Buka menu untuk mengaktifkan atau menambahkan hadiah.</p>
        </div>
      </div>
    );
  }

  // Exact Symmetrical Geometry
  const SVG_SIZE = 500;
  const C = SVG_SIZE / 2; // 250 (Exact Center)
  const R_OUTER_FRAME = 240; // Outer decorative bezel
  const R_PINS = 233; // Decorative pins radius
  const R_WHEEL = 222; // Pie slice radius
  const sliceAngle = 360 / numSegments;

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-7 select-none">
      {/* Perfectly Symmetrical Wheel Assembly Container */}
      <div className="relative flex items-center justify-center p-4">
        {/* Soft Ambient Radial Halo */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
            isSpinning
              ? 'w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] md:w-[520px] md:h-[520px] bg-sky-400/30 blur-3xl scale-110'
              : 'w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] bg-blue-400/15 blur-2xl'
          }`}
        />

        {/* Precision Pointer (Jarum Penunjuk di Jam 12) */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.25)]">
          {/* Pointer Pin Head */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white shadow-md -mb-1.5" />
          {/* Triangular Needle */}
          <svg width="32" height="38" viewBox="0 0 32 38" fill="none">
            <polygon
              points="16,36 3,4 29,4"
              fill="url(#needleGrad)"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* The Symmetrical Rotating Wheel */}
        <div
          ref={wheelRef}
          className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[470px] md:h-[470px] rounded-full shadow-[0_20px_50px_rgba(14,116,144,0.18)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isSpinning
              ? `transform ${config.spinDuration}ms cubic-bezier(0.12, 0.78, 0.1, 1)`
              : 'none',
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="w-full h-full block rounded-full"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              {/* Outer Bezel Gradient */}
              <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>

              {/* Center Hub Gradient */}
              <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Pin Gradient */}
              <radialGradient id="pinGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </radialGradient>

              {/* Drop Shadow for Hub */}
              <filter id="hubDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* 1. Outer Bezel Frame Ring */}
            <circle
              cx={C}
              cy={C}
              r={R_OUTER_FRAME}
              fill="url(#bezelGrad)"
              stroke="#cbd5e1"
              strokeWidth="2"
            />

            {/* Subtle Inset Shadow on Wheel Perimeter */}
            <circle
              cx={C}
              cy={C}
              r={R_WHEEL + 2}
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />

            {/* 2. Equal Pie Slices (Segments) */}
            {enabledPrizes.map((prize, index) => {
              const startAngle = index * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              const midAngle = startAngle + sliceAngle / 2;

              // Convert polar to cartesian (0 deg is 12 o'clock / top)
              const startRad = ((startAngle - 90) * Math.PI) / 180;
              const endRad = ((endAngle - 90) * Math.PI) / 180;

              const x1 = C + R_WHEEL * Math.cos(startRad);
              const y1 = C + R_WHEEL * Math.sin(startRad);
              const x2 = C + R_WHEEL * Math.cos(endRad);
              const y2 = C + R_WHEEL * Math.sin(endRad);

              const largeArc = sliceAngle > 180 ? 1 : 0;
              const textColor = getContrastColor(prize.color);
              const [line1, line2] = splitLabel(prize.name);

              // Radial distances for icon and text
              const iconDist = R_WHEEL * 0.74;
              const textDist = line2 ? R_WHEEL * 0.48 : R_WHEEL * 0.45;

              // Responsive text and icon size
              const fontSize = numSegments > 10 ? 11.5 : numSegments > 7 ? 13 : 14.5;
              const iconSize = numSegments > 10 ? 22 : numSegments > 7 ? 26 : 28;

              return (
                <g key={prize.id}>
                  {/* Segment Wedge */}
                  <path
                    d={`M ${C} ${C} L ${x1} ${y1} A ${R_WHEEL} ${R_WHEEL} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {/* Symmetrically Rotated Content along Slice Radial Axis */}
                  <g transform={`rotate(${midAngle} ${C} ${C})`}>
                    {/* Prize Icon */}
                    <text
                      x={C}
                      y={C - iconDist}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={iconSize}
                    >
                      {prize.icon}
                    </text>

                    {/* Prize Name Text */}
                    <text
                      x={C}
                      y={C - textDist}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={textColor}
                      fontSize={fontSize}
                      fontWeight="800"
                      letterSpacing="0.01em"
                      style={{
                        paintOrder: 'stroke fill',
                        stroke: textColor === '#ffffff' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.2)',
                        strokeWidth: '2.5px',
                      }}
                    >
                      {line2 ? (
                        <>
                          <tspan x={C} dy="-0.55em">
                            {line1}
                          </tspan>
                          <tspan x={C} dy="1.25em">
                            {line2}
                          </tspan>
                        </>
                      ) : (
                        line1
                      )}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* 3. Decorative Symmetrical Metallic Pins on Bezel */}
            {Array.from({ length: Math.max(numSegments * 2, 16) }).map((_, i) => {
              const totalPins = Math.max(numSegments * 2, 16);
              const angle = (i * 360) / totalPins;
              const rad = ((angle - 90) * Math.PI) / 180;
              const px = C + R_PINS * Math.cos(rad);
              const py = C + R_PINS * Math.sin(rad);

              return (
                <circle
                  key={`pin-${i}`}
                  cx={px}
                  cy={py}
                  r="3.5"
                  fill="url(#pinGrad)"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* 4. Center Hub (Perfect Circular Balance) */}
            <circle cx={C} cy={C} r="46" fill="#ffffff" filter="url(#hubDropShadow)" />
            <circle cx={C} cy={C} r="40" fill="url(#hubGrad)" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx={C} cy={C} r="15" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={C} cy={C} r="6" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Primary Spin Action Button */}
      <button
        onClick={spin}
        disabled={isSpinning || enabledPrizes.length < 2 || activePrizes.length === 0}
        className={`
          relative px-12 py-4 sm:px-16 sm:py-4.5 rounded-full text-base sm:text-lg font-black tracking-wider text-white uppercase
          transition-all duration-300 transform
          ${isSpinning || activePrizes.length === 0
            ? 'bg-slate-400 cursor-not-allowed scale-95 opacity-80 shadow-none'
            : 'bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35'
          }
        `}
      >
        {isSpinning ? (
          <span className="flex items-center gap-2.5">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Memutar…</span>
          </span>
        ) : activePrizes.length === 0 ? (
          <span>Semua Hadiah Habis (0%)</span>
        ) : (
          <span className="flex items-center gap-2">
            <span>✨</span>
            <span>PUTAR SEKARANG</span>
          </span>
        )}
      </button>

      {/* Result Modal Card */}
      {showResult && selectedPrize && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={closeResult}
        >
          <div
            className="bg-white border border-slate-100 text-slate-800 rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl animate-bounce-in relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Soft Ambient Light Glow */}
            <div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ backgroundColor: selectedPrize.color }}
            />

            <div className="text-6xl sm:text-7xl mb-4 animate-bounce">
              {selectedPrize.icon}
            </div>

            <p className="text-blue-600 font-extrabold uppercase tracking-widest text-xs mb-1.5">
              🎉 Selamat! Anda Mendapatkan:
            </p>

            <h2
              className="text-2xl sm:text-3xl font-black mb-3 leading-tight drop-shadow-sm"
              style={{ color: selectedPrize.color }}
            >
              {selectedPrize.name}
            </h2>

            {wasOneShotPrize && (
              <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                <span>⭐</span>
                <span>Hadiah Langka 1x! Peluang selanjutnya menjadi 0%</span>
              </div>
            )}

            <button
              onClick={closeResult}
              className="w-full py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
            >
              Ambil Hadiah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
