import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface ArrowStroopProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface ArrowItem {
  id: Direction;
  symbol: string;
  opposite: Direction;
}

const ARROWS: ArrowItem[] = [
  { id: 'up', symbol: '↑', opposite: 'down' },
  { id: 'down', symbol: '↓', opposite: 'up' },
  { id: 'left', symbol: '←', opposite: 'right' },
  { id: 'right', symbol: '→', opposite: 'left' }
];

export function ArrowStroop({ onFinish, onExit }: ArrowStroopProps) {
  const [round, setRound] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentArrow, setCurrentArrow] = useState<ArrowItem>(ARROWS[0]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const totalRounds = 20;

  const roundStartRef = useRef<number>(0);

  const nextArrow = () => {
    const next = ARROWS[Math.floor(Math.random() * ARROWS.length)];
    setCurrentArrow(next);
    roundStartRef.current = performance.now();
  };

  useEffect(() => {
    nextArrow();
  }, []);

  const handleInput = (chosenDir: Direction) => {
    const elapsed = performance.now() - roundStartRef.current;
    const isCorrect = chosenDir === currentArrow.opposite;

    if (isCorrect) {
      soundEngine.playGentleChime(620, 0.05);
      setCorrectCount((prev) => prev + 1);
    } else {
      soundEngine.playError();
    }

    const updatedRTs = [...reactionTimes, elapsed];
    setReactionTimes(updatedRTs);

    if (round >= totalRounds) {
      soundEngine.playSuccess();
      const finalCorrect = correctCount + (isCorrect ? 1 : 0);
      const acc = Math.round((finalCorrect / totalRounds) * 100);
      const avgRt = Math.round(updatedRTs.reduce((a, b) => a + b, 0) / updatedRTs.length);

      const score = Math.min(100, Math.max(10, Math.round(acc * 0.65 + Math.max(0, (900 - avgRt) * 0.06))));

      let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
      if (score >= 88) badge = 'Platinum';
      else if (score >= 75) badge = 'Gold';
      else if (score >= 60) badge = 'Silver';

      const { isPB } = recordSessionPlay('arrow', score, score, 'pts', {
        accuracy: acc,
        avgReactionTime: avgRt
      });

      onFinish({
        gameId: 'arrow',
        gameTitle: 'Arrow Inversion',
        scoreText: `${acc}% Acc`,
        metricLabel: `${avgRt}ms Average RT | Focus Score: ${score}`,
        badge,
        percentileText: badge === 'Platinum' ? 'Supreme Reflex Inversion' : 'Solid Set-Shifting Flexibility',
        barPercent: score,
        cognitiveSkill: 'Reinforces motor inhibition pathways and rapid mental orientation translation under speed.',
        isPB,
        onPlayAgain: () => {
          setRound(1);
          setCorrectCount(0);
          setReactionTimes([]);
          nextArrow();
        }
      });
    } else {
      setRound((prev) => prev + 1);
      nextArrow();
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleInput('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleInput('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleInput('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleInput('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentArrow, round, correctCount, reactionTimes]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Progress</span>
          <span className="font-mono font-bold text-stone-900 text-sm">{round} / {totalRounds}</span>
        </div>
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Accuracy</span>
          <span className="font-mono font-bold text-[#537158] text-sm">
            {round > 1 ? `${Math.round((correctCount / (round - 1)) * 100)}%` : '100%'}
          </span>
        </div>
      </div>

      {/* Main Stimulus Arrow */}
      <div className="flex flex-col items-center justify-center w-full py-10 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm mb-6 text-center">
        <div className="text-7xl font-mono text-[#537158] font-bold select-none leading-none">
          {currentArrow.symbol}
        </div>
        <div className="text-xs text-[#b97359] font-bold uppercase tracking-wider mt-3">
          Choose the OPPOSITE direction
        </div>
      </div>

      {/* Tactile D-Pad Controls */}
      <div className="grid grid-cols-3 gap-2.5 w-64 h-64 p-3 bg-stone-100/70 rounded-3xl border border-stone-200/60">
        <div />
        <button
          onClick={() => handleInput('up')}
          className="bg-white hover:bg-[#eaf1eb] text-stone-800 hover:text-[#3c5541] rounded-2xl border border-stone-200 font-bold text-2xl flex items-center justify-center shadow-xs active:scale-95 transition-all"
          aria-label="Up"
        >
          ↑
        </button>
        <div />

        <button
          onClick={() => handleInput('left')}
          className="bg-white hover:bg-[#eaf1eb] text-stone-800 hover:text-[#3c5541] rounded-2xl border border-stone-200 font-bold text-2xl flex items-center justify-center shadow-xs active:scale-95 transition-all"
          aria-label="Left"
        >
          ←
        </button>
        <div className="flex items-center justify-center text-[10px] text-stone-400 font-bold uppercase tracking-wider">
          Pad
        </div>
        <button
          onClick={() => handleInput('right')}
          className="bg-white hover:bg-[#eaf1eb] text-stone-800 hover:text-[#3c5541] rounded-2xl border border-stone-200 font-bold text-2xl flex items-center justify-center shadow-xs active:scale-95 transition-all"
          aria-label="Right"
        >
          →
        </button>

        <div />
        <button
          onClick={() => handleInput('down')}
          className="bg-white hover:bg-[#eaf1eb] text-stone-800 hover:text-[#3c5541] rounded-2xl border border-stone-200 font-bold text-2xl flex items-center justify-center shadow-xs active:scale-95 transition-all"
          aria-label="Down"
        >
          ↓
        </button>
        <div />
      </div>

      <p className="text-xs text-stone-400 text-center mt-4">
        Keyboard arrow keys (↑, ↓, ←, →) can also be used directly.
      </p>
    </div>
  );
}
