import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface SchulteTableProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

export function SchulteTable({ onFinish, onExit }: SchulteTableProps) {
  const [size, setSize] = useState<number>(5);
  const [target, setTarget] = useState<number>(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [completedCells, setCompletedCells] = useState<Set<number>>(new Set());
  const [wrongCell, setWrongCell] = useState<number | null>(null);
  const [errors, setErrors] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const maxNumber = size * size;

  const initGame = (gridSize: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const total = gridSize * gridSize;
    const arr = Array.from({ length: total }, (_, i) => i + 1);
    // Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    setNumbers(arr);
    setTarget(1);
    setCompletedCells(new Set());
    setErrors(0);
    setElapsed(0);
    setWrongCell(null);
    setIsPlaying(true);

    startTimeRef.current = performance.now();
    timerRef.current = window.setInterval(() => {
      const now = performance.now();
      setElapsed((now - startTimeRef.current) / 1000);
    }, 40);
  };

  useEffect(() => {
    initGame(size);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [size]);

  const handleCellClick = (num: number) => {
    if (!isPlaying) return;

    if (num === target) {
      soundEngine.playGentleChime(420 + target * 18, 0.05);
      const nextTarget = target + 1;
      setCompletedCells((prev) => new Set(prev).add(num));

      if (nextTarget > maxNumber) {
        // Complete!
        if (timerRef.current) clearInterval(timerRef.current);
        soundEngine.playSuccess();
        setIsPlaying(false);

        const finalTime = parseFloat(elapsed.toFixed(2));
        // Benchmark score calculation
        let normalized = 50;
        let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
        let percentile = 'Average Focus Speed';
        let barPercent = 50;

        if (size === 5) {
          normalized = Math.max(10, Math.min(100, Math.round(100 - (finalTime - 18) * 2.2)));
          if (finalTime <= 22) {
            badge = 'Platinum';
            percentile = 'Elite (Top 3%)';
            barPercent = 98;
          } else if (finalTime <= 32) {
            badge = 'Gold';
            percentile = 'Superior (Top 15%)';
            barPercent = 85;
          } else if (finalTime <= 45) {
            badge = 'Silver';
            percentile = 'Above Average (Top 35%)';
            barPercent = 68;
          }
        } else if (size === 3) {
          normalized = Math.max(10, Math.min(100, Math.round(100 - (finalTime - 4) * 8)));
          badge = finalTime <= 5 ? 'Platinum' : finalTime <= 8 ? 'Gold' : 'Silver';
          barPercent = 80;
        } else {
          normalized = Math.max(10, Math.min(100, Math.round(100 - (finalTime - 50) * 1.2)));
          badge = finalTime <= 65 ? 'Platinum' : finalTime <= 95 ? 'Gold' : 'Silver';
          barPercent = 75;
        }

        const { isPB } = recordSessionPlay('schulte', finalTime, normalized, 's', {
          gridSize: size,
          errors
        });

        onFinish({
          gameId: 'schulte',
          gameTitle: `Schulte Grid (${size}x${size})`,
          scoreText: `${finalTime}s`,
          metricLabel: `Completed in ${finalTime}s with ${errors} error${errors === 1 ? '' : 's'}`,
          badge,
          percentileText: percentile,
          barPercent,
          cognitiveSkill: 'Expands peripheral field radius and accelerates visual saccade search speed.',
          isPB,
          onPlayAgain: () => initGame(size)
        });
      } else {
        setTarget(nextTarget);
      }
    } else {
      soundEngine.playError();
      setErrors((prev) => prev + 1);
      setWrongCell(num);
      setTimeout(() => setWrongCell(null), 300);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto py-2">
      {/* Top Controls: Grid size switch */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl">
          {[3, 5, 7].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                size === s
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {s}x{s}
            </button>
          ))}
        </div>

        {/* HUD Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Time</span>
            <span className="font-mono font-bold text-stone-900 text-sm">{elapsed.toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Next Target</span>
            <span className="font-mono font-bold text-[#537158] text-sm">#{target}</span>
          </div>
          <div>
            <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Errors</span>
            <span className="font-mono font-bold text-stone-500 text-sm">{errors}</span>
          </div>
        </div>
      </div>

      {/* Grid Board */}
      <div
        className="grid gap-2 w-full p-4 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`
        }}
      >
        {numbers.map((num) => {
          const isDone = completedCells.has(num);
          const isWrong = wrongCell === num;

          return (
            <button
              key={num}
              onClick={() => handleCellClick(num)}
              disabled={isDone}
              className={`aspect-square flex items-center justify-center font-mono font-bold text-base sm:text-lg rounded-2xl transition-all duration-150 select-none ${
                isDone
                  ? 'bg-[#eaf1eb] text-[#3c5541]/40 border border-[#537158]/20 cursor-default scale-95'
                  : isWrong
                  ? 'bg-[#f7ece8] text-[#a05c44] border-2 border-[#b97359] animate-shake'
                  : 'bg-[#faf8f5] text-stone-800 hover:bg-[#eaf1eb] hover:text-[#3c5541] border border-stone-200/80 hover:border-[#537158]/40 shadow-xs active:scale-95'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-stone-500 mt-4">
        Keep your eyes gently focused on the center; use peripheral vision to locate numbers.
      </p>
    </div>
  );
}
