import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface NumberMemoryProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

export function NumberMemory({ onFinish, onExit }: NumberMemoryProps) {
  const [digits, setDigits] = useState<number>(3);
  const [targetNumber, setTargetNumber] = useState<string>('');
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [userInput, setUserInput] = useState<string>('');
  const [durationMs, setDurationMs] = useState<number>(3400);

  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startRound = (numDigits: number) => {
    let generated = '';
    for (let i = 0; i < numDigits; i++) {
      generated += Math.floor(Math.random() * 10).toString();
    }

    setTargetNumber(generated);
    setUserInput('');
    setPhase('memorize');

    // Display duration scales with digit length
    const time = 1400 + numDigits * 650;
    setDurationMs(time);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPhase('recall');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, time);
  };

  useEffect(() => {
    startRound(digits);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'recall') return;

    const trimmed = userInput.trim();
    if (trimmed === targetNumber) {
      soundEngine.playGentleChime(720, 0.08);
      const nextDigits = digits + 1;
      setDigits(nextDigits);
      startRound(nextDigits);
    } else {
      soundEngine.playError();
      const recalledDigits = digits - 1;
      const normalized = Math.min(100, Math.round((recalledDigits / 12) * 100));

      let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
      if (recalledDigits >= 10) badge = 'Platinum';
      else if (recalledDigits >= 8) badge = 'Gold';
      else if (recalledDigits >= 6) badge = 'Silver';

      const { isPB } = recordSessionPlay('number', recalledDigits, normalized, 'digits', {
        maxDigits: recalledDigits,
        failedOn: targetNumber,
        entered: trimmed
      });

      onFinish({
        gameId: 'number',
        gameTitle: 'Digit Span Memory',
        scoreText: `${recalledDigits} Digits`,
        metricLabel: `Recalled: ${recalledDigits} | Missed on "${targetNumber}" (Entered: "${trimmed || 'blank'}")`,
        badge,
        percentileText: recalledDigits >= 9 ? 'Superior Working Memory Span' : 'Normal Human Baseline (7±2 digits)',
        barPercent: normalized,
        cognitiveSkill: 'Tests pure short-term memory buffer capacity and internal phonological loop efficiency.',
        isPB,
        onPlayAgain: () => {
          setDigits(3);
          startRound(3);
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Current Span</span>
          <span className="font-mono font-bold text-stone-900 text-sm">{digits} Digits</span>
        </div>
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Phase</span>
          <span className="font-mono font-bold text-[#537158] text-sm capitalize">{phase}</span>
        </div>
      </div>

      {phase === 'memorize' ? (
        <div className="flex flex-col items-center justify-center w-full py-12 px-6 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm mb-6 text-center">
          <div className="text-4xl sm:text-5xl font-mono font-bold text-stone-900 tracking-[0.25em] select-none my-4">
            {targetNumber}
          </div>

          {/* Smooth progress bar */}
          <div className="w-full max-w-xs h-1.5 bg-stone-100 rounded-full overflow-hidden mt-6">
            <div
              className="h-full bg-[#537158] rounded-full"
              style={{
                animation: `shrinkWidth ${durationMs}ms linear forwards`
              }}
            />
          </div>
          <style>{`
            @keyframes shrinkWidth {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
          <span className="text-[11px] text-stone-400 mt-3 font-medium">
            Memorize this sequence before it disappears...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-full p-8 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm mb-4 text-center">
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
              Enter the remembered digit sequence
            </label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Type numbers..."
              autoFocus
              className="w-full py-3 px-4 text-3xl font-mono font-bold text-center tracking-[0.25em] text-stone-900 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#537158]/30 focus:border-[#537158] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] rounded-xl transition-all shadow-xs"
          >
            Submit Answer (Enter ➔)
          </button>
        </form>
      )}

      <p className="text-xs text-stone-400 text-center mt-6">
        Tip: Try grouping digits into pairs or triplets (chunking) to remember longer strings.
      </p>
    </div>
  );
}
