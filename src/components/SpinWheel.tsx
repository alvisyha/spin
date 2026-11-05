'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Prize, WheelConfig } from '@/types';
import { weightedRandom, getTargetRotation, generateSpinId } from '@/lib/weighted-random';
import { saveSpinResult } from '@/lib/storage';

interface SpinWheelProps {
  config: WheelConfig;
  onSpinComplete?: (prize: Prize) => void;
}

export default function SpinWheel({ config, onSpinComplete }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const enabledPrizes = config.prizes.filter(p => p.enabled);
  const totalWeight = enabledPrizes.reduce((sum, p) => sum + p.weight, 0);

  // Create tick sound effect
  useEffect(() => {
    // We'll use CSS animations instead of audio for compatibility
  }, []);

  const spin = useCallback(() => {
    if (isSpinning || enabledPrizes.length < 2) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);

    // Use weighted random to determine the result
    const winner = weightedRandom(config.prizes);
    const targetRotation = getTargetRotation(config.prizes, winner, config.minRotations);
    
    // Set the new rotation (cumulative to avoid backwards spinning)
    const newRotation = rotation + targetRotation;
    setRotation(newRotation);

    // After animation completes, show result
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(winner);
      setShowResult(true);
      
      // Save to history
      saveSpinResult({
        prize: winner,
        timestamp: new Date(),
        spinId: generateSpinId(),
      });

      onSpinComplete?.(winner);
    }, config.spinDuration + 500);
  }, [isSpinning, enabledPrizes, config, rotation, onSpinComplete]);

  const closeResult = () => {
    setShowResult(false);
  };

  if (enabledPrizes.length < 2) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <p className="text-yellow-800 text-lg font-medium">⚠️ Minimal 2 hadiah aktif diperlukan</p>
          <p className="text-yellow-600 mt-2">Tambahkan hadiah di dashboard admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer / Arrow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-red-600 drop-shadow-lg" />
          <div className="w-4 h-4 bg-red-600 rounded-full -mt-2 mx-auto" />
        </div>

        {/* Glow effect when spinning */}
        {isSpinning && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 blur-xl animate-pulse scale-110" />
        )}

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[420px] md:h-[420px] rounded-full shadow-2xl border-4 border-white/50 overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? `transform ${config.spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
              : 'none',
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {enabledPrizes.map((prize, index) => {
              let startAngle = 0;
              for (let i = 0; i < index; i++) {
                startAngle += (enabledPrizes[i].weight / totalWeight) * 360;
              }
              const sliceAngle = (prize.weight / totalWeight) * 360;
              const endAngle = startAngle + sliceAngle;

              // Convert to radians for SVG arc
              const startRad = ((startAngle - 90) * Math.PI) / 180;
              const endRad = ((endAngle - 90) * Math.PI) / 180;

              const x1 = 200 + 200 * Math.cos(startRad);
              const y1 = 200 + 200 * Math.sin(startRad);
              const x2 = 200 + 200 * Math.cos(endRad);
              const y2 = 200 + 200 * Math.sin(endRad);

              const largeArc = sliceAngle > 180 ? 1 : 0;

              // Text position (middle of slice)
              const midAngle = startAngle + sliceAngle / 2;
              const midRad = ((midAngle - 90) * Math.PI) / 180;
              const textX = 200 + 130 * Math.cos(midRad);
              const textY = 200 + 130 * Math.sin(midRad);
              const iconX = 200 + 160 * Math.cos(midRad);
              const iconY = 200 + 160 * Math.sin(midRad);

              return (
                <g key={prize.id}>
                  <path
                    d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-opacity hover:opacity-90"
                  />
                  {/* Prize icon */}
                  <text
                    x={iconX}
                    y={iconY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="24"
                    transform={`rotate(${midAngle}, ${iconX}, ${iconY})`}
                  >
                    {prize.icon}
                  </text>
                  {/* Prize name */}
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="bold"
                    fill="white"
                    transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {prize.name.length > 12 ? prize.name.substring(0, 12) + '...' : prize.name}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx="200" cy="200" r="30" fill="white" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="200" cy="200" r="20" fill="#1a1a2e" />
            <circle cx="200" cy="200" r="8" fill="white" />
          </svg>
        </div>

        {/* Decorative outer ring dots */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * 360;
            const rad = (angle * Math.PI) / 180;
            const size = i % 2 === 0 ? 'w-3 h-3' : 'w-2 h-2';
            const color = i % 2 === 0 ? 'bg-yellow-400' : 'bg-white';
            return (
              <div
                key={i}
                className={`absolute ${size} ${color} rounded-full ${isSpinning ? 'animate-pulse' : ''}`}
                style={{
                  left: `calc(50% + ${Math.cos(rad) * 50}% - 6px)`,
                  top: `calc(50% + ${Math.sin(rad) * 50}% - 6px)`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning || enabledPrizes.length < 2}
        className={`
          relative px-10 py-4 sm:px-14 sm:py-5 rounded-full text-lg sm:text-xl font-bold text-white
          transition-all duration-300 transform
          ${isSpinning 
            ? 'bg-gray-500 cursor-not-allowed scale-95' 
            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 hover:scale-105 hover:shadow-2xl active:scale-95 shadow-lg'
          }
        `}
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Spinning...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🎰 SPIN!
          </span>
        )}
        {!isSpinning && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 hover:opacity-100" />
        )}
      </button>

      {/* Result Modal */}
      {showResult && selectedPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeResult}>
          <div 
            className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl transform animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce">{selectedPrize.icon}</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🎉 Selamat!</h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-1">Anda mendapatkan:</p>
            <p 
              className="text-2xl sm:text-3xl font-extrabold mb-6"
              style={{ color: selectedPrize.color }}
            >
              {selectedPrize.name}
            </p>
            <button
              onClick={closeResult}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Custom animation keyframes */}
      <style jsx global>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
