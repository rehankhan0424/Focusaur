import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { GameDefinition } from '../types';

interface HowToPlayModalProps {
  game: GameDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function HowToPlayModal({ game, isOpen, onClose, onStart }: HowToPlayModalProps) {
  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-7 bg-[#faf8f5] border border-stone-200/90 rounded-3xl shadow-2xl text-stone-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/70 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eaf1eb] text-[#3c5541] flex items-center justify-center text-2xl shadow-xs border border-[#537158]/20">
            {game.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              {game.title}
            </h2>
            <div className="text-xs text-[#537158] font-medium flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{game.skillTag}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-600 mb-5 leading-relaxed bg-white/70 p-3 rounded-xl border border-stone-200/60">
          {game.shortDesc}
        </p>

        <div className="space-y-2.5 mb-6">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Instructions &amp; Objective
          </div>
          <div className="space-y-2">
            {game.rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-snug">
                <span className="w-4 h-4 rounded-full bg-[#eaf1eb] text-[#3c5541] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-5 py-2.5 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>Start Benchmark</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
