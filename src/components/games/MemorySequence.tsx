import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ResultModalData } from '../../types';
import { recordSessionPlay } from '../../services/storage';

interface MemorySequenceProps {
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
}

const TILES = [
  { id: 0, label: 'Moss', color: 'bg-[#537158]', lightColor: 'bg-[#7ba382]' },
  { id: 1, label: 'Terracotta', color: 'bg-[#b97359]', lightColor: 'bg-[#d89781]' },
  { id: 2, label: 'Ochre', color: 'bg-[#c9a96e]', lightColor: 'bg-[#dfc491]' },
  { id: 3, label: 'Slate', color: 'bg-[#648896]', lightColor: 'bg-[#89aab6]' }
];

export function MemorySequence({ onFinish, onExit }: MemorySequenceProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Observe the pattern sequence...');

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    startNewGame();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const startNewGame = () => {
    setSequence([]);
    setLevel(1);
    setPlayerStep(0);
    // Add first random tile
    const initialSeq = [Math.floor(Math.random() * 4)];
    setSequence(initialSeq);
    playSequence(initialSeq, 1);
  };

  const playSequence = async (seq: number[], lvl: number) => {
    setIsPlayerTurn(false);
    setStatusText('Observe the pattern sequence...');

    const delay = Math.max(260, 520 - lvl * 18);

    for (let i = 0; i < seq.length; i++) {
      if (!isMountedRef.current) return;
      await new Promise((r) => setTimeout(r, delay * 0.4));
      const tileIndex = seq[i];
      soundEngine.playSimonTone(tileIndex);
      setActiveTile(tileIndex);
      await new Promise((r) => setTimeout(r, delay));
      if (!isMountedRef.current) return;
      setActiveTile(null);
    }

    if (isMountedRef.current) {
      setIsPlayerTurn(true);
      setStatusText('Your turn! Replicate the sequence.');
      setPlayerStep(0);
    }
  };

  const handleTileClick = (index: number) => {
    if (!isPlayerTurn) return;

    soundEngine.playSimonTone(index);
    setActiveTile(index);
    setTimeout(() => setActiveTile(null), 200);

    if (index === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep >= sequence.length) {
        // Level cleared!
        soundEngine.playGentleChime(750, 0.08);
        setIsPlayerTurn(false);
        const nextLvl = level + 1;
        setLevel(nextLvl);
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setStatusText('Sequence verified! Preparing next tone...');
        setTimeout(() => {
          if (isMountedRef.current) playSequence(nextSeq, nextLvl);
        }, 700);
      }
    } else {
      // Failed!
      soundEngine.playError();
      setIsPlayerTurn(false);
      handleGameOver(level);
    }
  };

  const handleGameOver = (finalLevel: number) => {
    const reached = Math.max(1, finalLevel);
    const normalized = Math.min(100, Math.round((reached / 14) * 100));

    let badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
    if (reached >= 13) badge = 'Platinum';
    else if (reached >= 9) badge = 'Gold';
    else if (reached >= 6) badge = 'Silver';

    const { isPB } = recordSessionPlay('simon', reached, normalized, 'lvl', {
      maxLevel: reached
    });

    onFinish({
      gameId: 'simon',
      gameTitle: 'Harmonic Sequence',
      scoreText: `Level ${reached}`,
      metricLabel: `${reached - 1} Sequences Retained`,
      badge,
      percentileText: badge === 'Platinum' ? 'Supreme Visuospatial Span' : 'Excellent Memory Chunking',
      barPercent: normalized,
      cognitiveSkill: 'Engages the visuospatial sketchpad and rhythmic pattern retention in working memory.',
      isPB,
      onPlayAgain: () => startNewGame()
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto py-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Level</span>
          <span className="font-mono font-bold text-stone-900 text-sm">Level {level}</span>
        </div>
        <div>
          <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Sequence Length</span>
          <span className="font-mono font-bold text-[#537158] text-sm">{sequence.length} notes</span>
        </div>
      </div>

      <div className="text-xs font-semibold text-stone-600 mb-6 text-center h-4">
        {statusText}
      </div>

      {/* 4 Ceramic Tiles Grid */}
      <div className="grid grid-cols-2 gap-4 w-64 h-64 p-4 bg-white/90 border border-stone-200/90 rounded-3xl shadow-sm">
        {TILES.map((t) => {
          const isGlowing = activeTile === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTileClick(t.id)}
              disabled={!isPlayerTurn}
              className={`rounded-2xl transition-all duration-150 shadow-xs select-none ${
                isGlowing
                  ? `${t.lightColor} scale-95 shadow-md brightness-110`
                  : `${t.color} hover:brightness-105 active:scale-95`
              } ${!isPlayerTurn ? 'cursor-default' : 'cursor-pointer'}`}
              aria-label={t.label}
            />
          );
        })}
      </div>

      <p className="text-xs text-stone-400 text-center mt-6">
        Focus your ears and eyes together &bull; Internal audio-visual chunking improves recall.
      </p>
    </div>
  );
}
