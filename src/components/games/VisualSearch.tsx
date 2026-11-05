import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface VisualSearchProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

const PAIRS = [
  { normal: 'O', odd: 'Q' },
  { normal: 'E', odd: 'F' },
  { normal: 'C', odd: 'G' },
  { normal: 'P', odd: 'R' },
  { normal: 'V', odd: 'U' },
  { normal: 'M', odd: 'W' },
  { normal: '8', odd: 'B' },
  { normal: '0', odd: '8' },
  { normal: 'S', odd: '5' },
  { normal: 'K', odd: 'X' }
];

export function VisualSearch({ onFinish, onExit }: VisualSearchProps) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gridSize, setGridSize] = useState(3);
  const [cells, setCells] = useState<string[]>([]);
  const [oddIndex, setOddIndex] = useState(0);
  const totalRounds = 10;

  const roundStartRef = useRef<number>(0);

  const setupRound = (r: number) => {
    let size = 3;
    if (r >= 4 && r <= 6) size = 4;
    else if (r >= 7 && r <= 8) size = 5;
    else if (r >= 9) size = 6;
    setGridSize(size);

    const totalCells = size * size;
    const targetOddIndex = Math.floor(Math.random() * totalCells);
    setOddIndex(targetOddIndex);

    const pair = PAIRS[(r - 1) % PAIRS.length];
    const generated = Array.from({ length: totalCells }, (_, i) =>
      i === targetOddIndex ? pair.odd : pair.normal
    );
    setCells(generated);
    roundStartRef.current = performance.now();
  };

  useEffect(() => {
    setupRound(1);
  }, []);

  const handleCellClick = (index: number) => {
    const elapsed = performance.now() - roundStartRef.current;

    if (index === oddIndex) {
      soundEngine.playGentleChime(660, 0.06);
      const points = Math.max(20, Math.round(100 - elapsed / 50));
      const nextScore = score + points;
      setScore(nextScore);

      if (round >= totalRounds) {
        soundEngine.playSuccess();
        const normalized = Math.min(100, Math.round((nextScore / 1000) * 100));

        let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
        if (normalized >= 85) badge = 'Platinum';
        else if (normalized >= 70) badge = 'Gold';
        else if (normalized >= 55) badge = 'Silver';

        const { isPB } = recordSessionPlay('odd', nextScore, normalized, 'pts', {
          totalScore: nextScore,
          rounds: totalRounds
        });

        onFinish({
          gameId: 'odd',
          gameTitle: 'Visual Discrimination',
          scoreText: `${normalized} Pts`,
          metricLabel: `Total Discovery Points: ${nextScore}`,
          badge,
          percentileText: badge === 'Platinum' ? 'Supreme Visual Anomaly Discrimination' : 'Speedy Feature Identification',
          barPercent: normalized,
          cognitiveSkill: 'Evaluates selective visual attention, feature binding, and scanning agility.',
          isPB,
          onPlayAgain: () => {
            setRound(1);
            setScore(0);
            setupRound(1);
          }
        });
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        setupRound(nextRound);
      }
    } else {
      soundEngine.playError();
      setScore((prev) => Math.max(0, prev - 25));
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Round</span>
          <span className="font-mono font-bold text-stone-900 text-sm">{round} / {totalRounds}</span>
        </div>
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Focus Score</span>
          <span className="font-mono font-bold text-[#537158] text-sm">{score} pts</span>
        </div>
      </div>

      <div className="text-xs text-stone-500 mb-4 text-center">
        Spot the single divergent glyph anomaly as fast as you can.
      </div>

      {/* Grid */}
      <div
        className="grid gap-2 w-full p-4 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
        }}
      >
        {cells.map((char, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            className="aspect-square flex items-center justify-center font-mono font-bold text-lg sm:text-2xl rounded-2xl bg-[#faf8f5] hover:bg-[#eaf1eb] text-stone-800 hover:text-[#3c5541] border border-stone-200/80 hover:border-[#537158]/40 shadow-2xs active:scale-95 transition-all select-none"
          >
            {char}
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-400 text-center mt-5">
        Grid dimensions scale up as you progress into advanced rounds.
      </p>
    </div>
  );
}
