import React from 'react';
import { GameId, GameDefinition, ResultModalData } from '../../types';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { SchulteTable } from '../games/SchulteTable';
import { StroopTest } from '../games/StroopTest';
import { ArrowStroop } from '../games/ArrowStroop';
import { ReactionTime } from '../games/ReactionTime';
import { MemorySequence } from '../games/MemorySequence';
import { NumberMemory } from '../games/NumberMemory';
import { VisualSearch } from '../games/VisualSearch';
import { ContinuousPerformance } from '../games/ContinuousPerformance';

interface ActiveGameViewProps {
  gameId: GameId;
  definition: GameDefinition;
  onFinish: (result: ResultModalData) => void;
  onExit: () => void;
  onOpenHelp: () => void;
}

export function ActiveGameView({
  gameId,
  definition,
  onFinish,
  onExit,
  onOpenHelp
}: ActiveGameViewProps) {
  const renderGame = () => {
    switch (gameId) {
      case 'schulte':
        return <SchulteTable onFinish={onFinish} onExit={onExit} />;
      case 'stroop':
        return <StroopTest onFinish={onFinish} onExit={onExit} />;
      case 'arrow':
        return <ArrowStroop onFinish={onFinish} onExit={onExit} />;
      case 'reaction':
        return <ReactionTime onFinish={onFinish} onExit={onExit} />;
      case 'simon':
        return <MemorySequence onFinish={onFinish} onExit={onExit} />;
      case 'number':
        return <NumberMemory onFinish={onFinish} onExit={onExit} />;
      case 'odd':
        return <VisualSearch onFinish={onFinish} onExit={onExit} />;
      case 'cpt':
        return <ContinuousPerformance onFinish={onFinish} onExit={onExit} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/60 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold font-serif text-stone-900 flex items-center justify-center gap-2">
            <span>{definition.icon}</span>
            <span>{definition.title}</span>
          </h2>
          <span className="text-[11px] text-[#537158] font-medium block">
            {definition.skillTag}
          </span>
        </div>

        <button
          onClick={onOpenHelp}
          title="View Rules & Objectives"
          className="p-1.5 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/60 rounded-xl transition-colors"
          aria-label="How to play"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Main Game Arena */}
      <div className="p-6 sm:p-8 bg-white/95 border border-stone-200/90 rounded-3xl shadow-sm min-h-[460px] flex items-center justify-center">
        {renderGame()}
      </div>
    </div>
  );
}
