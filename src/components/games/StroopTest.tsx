import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface StroopTestProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

interface ColorChoice {
  name: string;
  hex: string;
}

const COLORS: ColorChoice[] = [
  { name: 'RED', hex: '#b97359' },      // Warm terracotta red
  { name: 'BLUE', hex: '#648896' },     // Calming slate river blue
  { name: 'GREEN', hex: '#537158' },    // Forest sage green
  { name: 'AMBER', hex: '#c9a96e' },    // Wheat ochre
  { name: 'PURPLE', hex: '#8a7d99' },   // Muted lavender
  { name: 'CHARCOAL', hex: '#2b2825' }  // Deep slate charcoal
];

export function StroopTest({ onFinish, onExit }: StroopTestProps) {
  const [round, setRound] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [word, setWord] = useState<ColorChoice>(COLORS[0]);
  const [ink, setInk] = useState<ColorChoice>(COLORS[1]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const totalRounds = 20;

  const roundStartRef = useRef<number>(0);

  const nextStimulus = () => {
    // Pick random word
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    // Pick different ink color
    let i: ColorChoice;
    do {
      i = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (i.name === w.name);

    setWord(w);
    setInk(i);
    roundStartRef.current = performance.now();
  };

  useEffect(() => {
    nextStimulus();
  }, []);

  const handleChoice = (colorName: string) => {
    const elapsed = performance.now() - roundStartRef.current;
    const isCorrect = colorName === ink.name;

    if (isCorrect) {
      soundEngine.playGentleChime(580, 0.05);
      setCorrectCount((prev) => prev + 1);
    } else {
      soundEngine.playError();
    }

    const updatedRTs = [...reactionTimes, elapsed];
    setReactionTimes(updatedRTs);

    if (round >= totalRounds) {
      // Completed!
      soundEngine.playSuccess();
      const finalCorrect = correctCount + (isCorrect ? 1 : 0);
      const acc = Math.round((finalCorrect / totalRounds) * 100);
      const avgRt = Math.round(updatedRTs.reduce((a, b) => a + b, 0) / updatedRTs.length);

      // Score formula
      const score = Math.min(100, Math.max(10, Math.round(acc * 0.7 + Math.max(0, (1000 - avgRt) * 0.05))));

      let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
      if (score >= 88) badge = 'Platinum';
      else if (score >= 75) badge = 'Gold';
      else if (score >= 60) badge = 'Silver';

      const { isPB } = recordSessionPlay('stroop', score, score, 'pts', {
        accuracy: acc,
        avgReactionTime: avgRt
      });

      onFinish({
        gameId: 'stroop',
        gameTitle: 'Stroop Color Interference',
        scoreText: `${acc}% Acc`,
        metricLabel: `${avgRt}ms Average Speed | Focus Score: ${score}`,
        badge,
        percentileText: badge === 'Platinum' ? 'Elite Inhibitory Control' : 'High Cognitive Resistance',
        barPercent: score,
        cognitiveSkill: 'Assesses executive inhibitory control and resistance to involuntary automated reading.',
        isPB,
        onPlayAgain: () => {
          setRound(1);
          setCorrectCount(0);
          setReactionTimes([]);
          nextStimulus();
        }
      });
    } else {
      setRound((prev) => prev + 1);
      nextStimulus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto py-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full mb-8">
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

      {/* Central Stimulus Word */}
      <div className="flex flex-col items-center justify-center w-full py-12 px-6 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm mb-8 text-center min-h-[170px]">
        <div
          className="text-5xl sm:text-6xl font-black font-serif tracking-wide transition-transform duration-100"
          style={{ color: ink.hex }}
        >
          {word.name}
        </div>
        <div className="text-xs text-stone-400 font-medium uppercase tracking-widest mt-3">
          Select physical ink color &bull; Inhibit reading
        </div>
      </div>

      {/* 6 Color Options */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {COLORS.map((col) => (
          <button
            key={col.name}
            onClick={() => handleChoice(col.name)}
            className="py-3 px-2 rounded-2xl font-bold text-xs tracking-wider uppercase text-white shadow-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center min-h-[50px]"
            style={{ backgroundColor: col.hex }}
          >
            {col.name}
          </button>
        ))}
      </div>
    </div>
  );
}
