import React from 'react';
import { Trophy, RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import { ResultModalData } from '../types';

interface ResultModalProps {
  data: ResultModalData | null;
  isOpen: boolean;
  onClose: () => void;
  onExitToMenu: () => void;
}

export function ResultModal({ data, isOpen, onClose, onExitToMenu }: ResultModalProps) {
  if (!isOpen || !data) return null;

  const badgeStyles = {
    Platinum: 'bg-gradient-to-r from-slate-100 to-stone-200 text-stone-800 border-stone-300',
    Gold: 'bg-[#fbf6ee] text-[#947635] border-[#c9a96e]/40',
    Silver: 'bg-stone-100 text-stone-700 border-stone-200',
    Bronze: 'bg-[#f7ece8] text-[#a05c44] border-[#c4836a]/30'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-7 bg-[#faf8f5] border border-stone-200/90 rounded-3xl shadow-2xl text-stone-800 text-center">
        
        {/* PB Banner */}
        {data.isPB && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 text-[11px] font-bold text-[#3c5541] bg-[#eaf1eb] border border-[#537158]/30 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW PERSONAL BEST!</span>
          </div>
        )}

        {/* Badge */}
        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${
              badgeStyles[data.badge]
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{data.badge} Performer</span>
          </div>
        </div>

        {/* Score highlight */}
        <h2 className="text-4xl sm:text-5xl font-mono font-bold text-stone-900 tracking-tight my-2">
          {data.scoreText}
        </h2>
        <div className="text-xs text-stone-500 font-medium mb-5">
          {data.metricLabel}
        </div>

        {/* Benchmark scale card */}
        <div className="p-4 bg-white/90 border border-stone-200/80 rounded-2xl mb-5 text-left">
          <div className="flex justify-between items-center text-xs font-bold text-stone-800 mb-1.5">
            <span>Benchmark Standing</span>
            <span className="text-[#537158]">{data.percentileText}</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-[#537158] to-[#719077] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, data.barPercent))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 font-medium">
            <span>Average</span>
            <span>Proficient</span>
            <span>Elite</span>
          </div>
        </div>

        {/* Cognitive Skill note */}
        <p className="text-xs text-stone-600 bg-stone-100/60 p-3 rounded-xl mb-6 text-left leading-relaxed">
          <strong>Brain Faculty:</strong> {data.cognitiveSkill}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onExitToMenu();
            }}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Back to Suite</span>
          </button>
          <button
            onClick={() => {
              onClose();
              data.onPlayAgain();
            }}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
