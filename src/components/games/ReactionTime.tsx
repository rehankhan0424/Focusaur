import React, { useState, useRef, useEffect } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface ReactionTimeProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

type ReactionState = 'idle' | 'waiting' | 'ready' | 'early' | 'roundResult';

export function ReactionTime({ onFinish, onExit }: ReactionTimeProps) {
  const [state, setState] = useState<ReactionState>('idle');
  const [attempts, setAttempts] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const maxAttempts = 5;

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (state === 'idle' || state === 'roundResult' || state === 'early') {
      // Transition to waiting
      setState('waiting');
      const delay = Math.random() * 2500 + 1500; // 1.5s to 4s random delay
      timerRef.current = window.setTimeout(() => {
        setState('ready');
        startTimeRef.current = performance.now();
        soundEngine.playGentleChime(880, 0.05);
      }, delay);
    } else if (state === 'waiting') {
      // Clicked too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      soundEngine.playError();
      setState('early');
    } else if (state === 'ready') {
      // Good hit!
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      soundEngine.playGentleChime(620, 0.06);
      setCurrentScore(elapsed);
      const updated = [...attempts, elapsed];
      setAttempts(updated);

      if (updated.length >= maxAttempts) {
        // Complete benchmark!
        soundEngine.playSuccess();
        const avg = Math.round(updated.reduce((a, b) => a + b, 0) / updated.length);
        const best = Math.min(...updated);

        let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
        let percentile = 'Normative (<400ms)';
        let barPercent = 50;
        let normalized = Math.max(10, Math.min(100, Math.round(100 - (avg - 190) * 0.35)));

        if (avg < 210) {
          badge = 'Platinum';
          percentile = 'Elite Reflex Velocity (<210ms)';
          barPercent = 98;
        } else if (avg < 290) {
          badge = 'Gold';
          percentile = 'Fast Reflexes (210-290ms)';
          barPercent = 85;
        } else if (avg < 370) {
          badge = 'Silver';
          percentile = 'Average Population (290-370ms)';
          barPercent = 65;
        }

        const { isPB } = recordSessionPlay('reaction', avg, normalized, 'ms', {
          bestAttempt: best,
          attempts: updated
        });

        onFinish({
          gameId: 'reaction',
          gameTitle: 'Reaction Velocity',
          scoreText: `${avg} ms`,
          metricLabel: `5-Trial Mean Average (Fastest: ${best}ms)`,
          badge,
          percentileText: percentile,
          barPercent,
          cognitiveSkill: 'Measures visual afferent transmission speed and motor unit recruitment velocity.',
          isPB,
          onPlayAgain: () => {
            setAttempts([]);
            setCurrentScore(null);
            setState('idle');
          }
        });
      } else {
        setState('roundResult');
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto py-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Trials</span>
          <span className="font-mono font-bold text-stone-900 text-sm">
            {Math.min(maxAttempts, attempts.length + 1)} / {maxAttempts}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxAttempts }).map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < attempts.length
                  ? 'bg-[#537158] scale-110'
                  : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Running Average</span>
          <span className="font-mono font-bold text-[#537158] text-sm">
            {attempts.length > 0
              ? `${Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)}ms`
              : '--'}
          </span>
        </div>
      </div>

      {/* Main Touch Arena */}
      <div
        onClick={handleClick}
        className={`w-full h-80 rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-150 p-6 text-center border ${
          state === 'idle'
            ? 'bg-white hover:bg-stone-50 border-stone-200/90 shadow-sm'
            : state === 'waiting'
            ? 'bg-[#f7ece8] border-[#b97359]/40 shadow-md'
            : state === 'ready'
            ? 'bg-[#eaf1eb] border-[#537158] shadow-lg scale-[1.01]'
            : state === 'early'
            ? 'bg-[#fbf6ee] border-[#c9a96e]/50 shadow-xs'
            : 'bg-white border-stone-200/90 shadow-sm'
        }`}
      >
        {state === 'idle' && (
          <>
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-2xl font-bold font-serif text-stone-900">Click to Begin</h3>
            <p className="text-xs text-stone-500 mt-2 max-w-xs">
              When the screen turns soothing green, tap as quickly as humanly possible.
            </p>
          </>
        )}

        {state === 'waiting' && (
          <>
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <h3 className="text-2xl font-bold font-serif text-[#a05c44]">Wait for Green...</h3>
            <p className="text-xs text-[#a05c44]/80 mt-1">Do not tap yet!</p>
          </>
        )}

        {state === 'ready' && (
          <>
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-3xl font-black font-serif text-[#2f4633] tracking-wider animate-bounce">
              TAP NOW!
            </h3>
          </>
        )}

        {state === 'early' && (
          <>
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold font-serif text-[#947635]">Premature Tap!</h3>
            <p className="text-xs text-stone-500 mt-1">
              You clicked before the green signal. Tap anywhere to re-try this trial.
            </p>
          </>
        )}

        {state === 'roundResult' && (
          <>
            <div className="text-4xl font-mono font-bold text-stone-900 mb-2">
              {currentScore} ms
            </div>
            <p className="text-xs text-[#537158] font-semibold">
              Trial recorded &bull; Tap anywhere for next trial
            </p>
          </>
        )}
      </div>

      <p className="text-xs text-stone-400 text-center mt-4">
        Ensure a relaxed, stable grip or rest your finger comfortably on mouse/screen.
      </p>
    </div>
  );
}
