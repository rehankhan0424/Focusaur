import React, { useState } from 'react';
import { GameId, GameCategory, GameStats, StreakInfo } from '../../types';
import { GAME_DEFINITIONS } from '../../data/games';
import { calculateFocusScore, getTotalPlays } from '../../services/storage';
import { ArrowRight, Sparkles, Wind, Trophy } from 'lucide-react';

interface HomeViewProps {
  stats: Record<GameId, GameStats>;
  streak: StreakInfo;
  onLaunchGame: (id: GameId) => void;
  onOpenWarmup: () => void;
}

export function HomeView({ stats, streak, onLaunchGame, onOpenWarmup }: HomeViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | GameCategory>('all');

  const focusScore = calculateFocusScore(stats);
  const totalPlays = getTotalPlays(stats);

  let standingTier = 'Novice';
  if (focusScore >= 85) standingTier = 'Master';
  else if (focusScore >= 70) standingTier = 'Proficient';
  else if (focusScore >= 50) standingTier = 'Skilled';

  // Count how many games played today
  const todayStr = new Date().toISOString().slice(0, 10);
  const playedTodayCount = Object.values(stats).filter((g) => g.lastPlayed === todayStr).length;
  const masteryPct = Math.round((playedTodayCount / 8) * 100);

  const gameList = Object.values(GAME_DEFINITIONS).filter((g) => {
    if (selectedFilter === 'all') return true;
    return g.category.includes(selectedFilter);
  });

  const getBestScoreDisplay = (id: GameId) => {
    const g = stats[id];
    if (g.bestRaw === null) return '--';
    if (id === 'schulte') return `${g.bestRaw}s`;
    if (id === 'reaction') return `${g.bestRaw}ms`;
    if (id === 'simon') return `Lvl ${g.bestRaw}`;
    if (id === 'number') return `${g.bestRaw} dig`;
    return `${g.bestRaw} pts`;
  };

  return (
    <div className="space-y-10">
      
      {/* Hero Banner: Organic & Minimalist */}
      <section className="relative overflow-hidden p-8 sm:p-10 bg-gradient-to-br from-[#faf8f5] via-[#f4f0e8] to-[#eaf1eb] border border-stone-200/90 rounded-3xl shadow-sm">
        {/* Soft background light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#537158]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#537158]">
              <span>Scientific Neuro-Conditioning</span>
              <span aria-hidden="true">&bull;</span>
              <span>8 Core Faculties</span>
              <span aria-hidden="true">&bull;</span>
              <span>Soothing Visuals</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
              Train Your Focus.{' '}
              <span className="text-[#537158] font-normal italic">Outsmart Distraction.</span>
            </h1>

            <p className="text-sm text-stone-600 leading-relaxed max-w-lg">
              Science-grounded cognitive training engineered to sharpen sustained attention, working memory capacity, and mental processing speed—without digital eye strain.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onLaunchGame('schulte')}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <span>Begin Daily Training</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenWarmup}
                className="px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-2xs flex items-center gap-2"
              >
                <Wind className="w-3.5 h-3.5 text-[#537158]" />
                <span>Zen Eye Calmer</span>
              </button>
            </div>
          </div>

          {/* Focus Score Ring Card */}
          <div className="flex items-center gap-6 p-5 sm:p-6 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f1ede5"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#537158"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (focusScore / 100) * 251.2}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono font-bold text-2xl text-stone-900 tabular-nums">
                  {focusScore}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                  Score
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                  Standing
                </span>
                <span className="font-bold text-[#537158]">{standingTier}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                  Sessions Done
                </span>
                <span className="font-mono font-semibold text-stone-800">{totalPlays}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                  Active Streak
                </span>
                <span className="font-mono font-semibold text-[#947635]">
                  {streak.count} {streak.count === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Header & Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900 tracking-tight">
            Cognitive Training Modules
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Select an exercise faculty to assess and strengthen
          </p>
        </div>

        {/* Interactive segmented filter control */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Modules
          </button>
          <button
            onClick={() => setSelectedFilter('attention')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'attention'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Attention
          </button>
          <button
            onClick={() => setSelectedFilter('speed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'speed'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Processing Speed
          </button>
          <button
            onClick={() => setSelectedFilter('memory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'memory'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Working Memory
          </button>
        </div>
      </div>

      {/* Game Cards Grid (Clean Anti-Slop / Zero-Pill Typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameList.map((game) => (
          <div
            key={game.id}
            onClick={() => onLaunchGame(game.id)}
            className="group flex flex-col justify-between p-5 bg-white/95 hover:bg-white border border-stone-200/90 hover:border-[#537158]/40 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left"
          >
            <div>
              {/* Top icon and subtle text meta (Zero-Pill!) */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#eaf1eb] text-[#3c5541] flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                  {game.icon}
                </div>
                <div className="text-[11px] font-semibold text-stone-400">
                  <span>{game.difficulty}</span>
                </div>
              </div>

              <h3 className="text-base font-bold font-serif text-stone-900 group-hover:text-[#537158] transition-colors mb-1">
                {game.title}
              </h3>

              {/* Quiet unboxed metadata */}
              <div className="text-[11px] font-medium text-[#537158] mb-2.5">
                {game.skillTag}
              </div>

              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                {game.shortDesc}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">
                  Best Record
                </span>
                <span className="font-mono font-bold text-xs text-stone-800">
                  {getBestScoreDisplay(game.id)}
                </span>
              </div>

              <span className="text-xs font-semibold text-[#537158] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Train ➔
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Mastery Bar */}
      <div className="p-6 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#c9a96e]" />
            <h4 className="text-sm font-bold font-serif text-stone-900">
              Daily Cognitive Engagement
            </h4>
          </div>
          <p className="text-xs text-stone-500">
            Neuroplasticity research indicates exercising 3+ distinct faculties each day provides optimal adaptation.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0 min-w-[200px]">
          <span className="text-xs font-mono font-bold text-stone-800">
            {playedTodayCount} / 8 Modules Exercised Today
          </span>
          <div className="w-full sm:w-48 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#537158] to-[#719077] rounded-full transition-all duration-500"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
