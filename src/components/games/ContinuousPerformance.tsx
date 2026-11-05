import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface ContinuousPerformanceProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

const DISTRACTORS = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'K', 'L', 'M', 'O', 'P', 'R', 'S', 'T'];

function calcZ(p: number): number {
  const clamped = Math.max(0.01, Math.min(0.99, p));
  const t = Math.sqrt(-2 * Math.log(clamped < 0.5 ? clamped : 1 - clamped));
  const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
  const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
  const z = t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1);
  return clamped < 0.5 ? -z : z;
}

export function ContinuousPerformance({ onFinish, onExit }: ContinuousPerformanceProps) {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [letter, setLetter] = useState<string>('');
  const [isLetterVisible, setIsLetterVisible] = useState<boolean>(false);
  const [hits, setHits] = useState<number>(0);
  const [falseAlarms, setFalseAlarms] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [correctRejections, setCorrectRejections] = useState<number>(0);

  const stateRef = useRef({
    isTarget: false,
    hasResponded: false,
    hits: 0,
    misses: 0,
    falseAlarms: 0,
    correctRejections: 0,
    timeLeft: 60,
    active: true
  });

  const timerIntervalRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);

  const flashNext = () => {
    if (!stateRef.current.active || stateRef.current.timeLeft <= 0) return;

    const isTarget = Math.random() < 0.28;
    const l = isTarget ? 'X' : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];

    stateRef.current.isTarget = isTarget;
    stateRef.current.hasResponded = false;

    setLetter(l);
    setIsLetterVisible(true);

    flashTimeoutRef.current = window.setTimeout(() => {
      setIsLetterVisible(false);

      // Check if target was missed
      if (stateRef.current.isTarget && !stateRef.current.hasResponded) {
        stateRef.current.misses += 1;
        setMisses(stateRef.current.misses);
      } else if (!stateRef.current.isTarget && !stateRef.current.hasResponded) {
        stateRef.current.correctRejections += 1;
        setCorrectRejections(stateRef.current.correctRejections);
      }

      // Next interval
      if (stateRef.current.timeLeft > 0 && stateRef.current.active) {
        flashTimeoutRef.current = window.setTimeout(flashNext, 200);
      }
    }, 550);
  };

  const finishTest = () => {
    stateRef.current.active = false;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

    soundEngine.playSuccess();

    const totalTargets = stateRef.current.hits + stateRef.current.misses;
    const hitRate = totalTargets > 0 ? stateRef.current.hits / totalTargets : 0;
    const totalNonTargets = stateRef.current.falseAlarms + stateRef.current.correctRejections;
    const faRate = totalNonTargets > 0 ? stateRef.current.falseAlarms / totalNonTargets : 0;

    const zHit = calcZ(hitRate);
    const zFA = calcZ(faRate);
    const dPrime = Math.max(0, Math.min(4.5, zHit - zFA));
    const score = Math.max(10, Math.min(100, Math.round((dPrime / 3.8) * 100)));

    let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
    if (score >= 88) badge = 'Platinum';
    else if (score >= 72) badge = 'Gold';
    else if (score >= 55) badge = 'Silver';

    const { isPB } = recordSessionPlay('cpt', score, score, '/100', {
      hits: stateRef.current.hits,
      totalTargets,
      falseAlarms: stateRef.current.falseAlarms,
      dPrime: parseFloat(dPrime.toFixed(2))
    });

    onFinish({
      gameId: 'cpt',
      gameTitle: 'Vigilance Index (CPT)',
      scoreText: `${score} / 100`,
      metricLabel: `Hits: ${stateRef.current.hits}/${totalTargets} | False Alarms: ${stateRef.current.falseAlarms} | d': ${dPrime.toFixed(2)}`,
      badge,
      percentileText: badge === 'Platinum' ? 'Elite Attentional Vigilance' : 'Strong Sustained Attention',
      barPercent: score,
      cognitiveSkill: 'Measures resistance to attentional drift and signal detection sensitivity (d-prime).',
      isPB,
      onPlayAgain: () => {
        setTimeLeft(60);
        setHits(0);
        setFalseAlarms(0);
        setMisses(0);
        setCorrectRejections(0);
        stateRef.current = {
          isTarget: false,
          hasResponded: false,
          hits: 0,
          misses: 0,
          falseAlarms: 0,
          correctRejections: 0,
          timeLeft: 60,
          active: true
        };
        startTest();
      }
    });
  };

  const handleHit = () => {
    if (!stateRef.current.active || stateRef.current.hasResponded) return;
    stateRef.current.hasResponded = true;

    if (stateRef.current.isTarget) {
      soundEngine.playGentleChime(700, 0.05);
      stateRef.current.hits += 1;
      setHits(stateRef.current.hits);
    } else {
      soundEngine.playError();
      stateRef.current.falseAlarms += 1;
      setFalseAlarms(stateRef.current.falseAlarms);
    }
  };

  const startTest = () => {
    timerIntervalRef.current = window.setInterval(() => {
      stateRef.current.timeLeft -= 1;
      setTimeLeft(stateRef.current.timeLeft);
      if (stateRef.current.timeLeft <= 0) {
        finishTest();
      }
    }, 1000);

    flashNext();
  };

  useEffect(() => {
    startTest();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      stateRef.current.active = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Time Remaining</span>
          <span className="font-mono font-bold text-stone-900 text-sm">{timeLeft}s</span>
        </div>
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Hits</span>
          <span className="font-mono font-bold text-[#537158] text-sm">{hits}</span>
        </div>
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">False Alarms</span>
          <span className="font-mono font-bold text-[#b97359] text-sm">{falseAlarms}</span>
        </div>
      </div>

      {/* Main Flash Area */}
      <div className="flex items-center justify-center w-full h-56 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm mb-6 text-center select-none">
        <div
          className={`text-8xl font-mono font-bold transition-opacity duration-100 ${
            isLetterVisible ? 'opacity-100' : 'opacity-0'
          } ${letter === 'X' ? 'text-[#3c5541]' : 'text-stone-700'}`}
        >
          {letter}
        </div>
      </div>

      {/* Big Action Button */}
      <button
        onClick={handleHit}
        className="w-full py-4 px-6 text-sm font-bold text-white bg-[#537158] hover:bg-[#435c46] rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
      >
        <span>🎯 HIT TARGET (SPACEBAR)</span>
      </button>

      <p className="text-xs text-stone-400 text-center mt-4">
        Respond ONLY when the target letter <strong className="text-stone-700 font-mono">X</strong> flashes. Ignore all other letters.
      </p>
    </div>
  );
}
