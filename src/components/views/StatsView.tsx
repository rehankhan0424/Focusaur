import React from 'react';
import { GameId, GameStats, StreakInfo } from '../../types';
import { GAME_DEFINITIONS } from '../../data/games';
import { calculateFocusScore, getTotalPlays } from '../../services/storage';
import { RotateCcw, Award, CheckCircle, Shield } from 'lucide-react';

interface StatsViewProps {
  stats: Record<GameId, GameStats>;
  streak: StreakInfo;
  onLaunchGame: (id: GameId) => void;
  onResetStats: () => void;
}

export function StatsView({ stats, streak, onLaunchGame, onResetStats }: StatsViewProps) {
  const focusScore = calculateFocusScore(stats);
  const totalPlays = getTotalPlays(stats);

  const getTier = (id: GameId) => {
    const g = stats[id];
    if (g.bestNormalized === null) return { name: 'Untested', color: 'bg-stone-100 text-stone-500' };
    if (g.bestNormalized >= 85) return { name: 'Platinum', color: 'bg-stone-200 text-stone-800' };
    if (g.bestNormalized >= 70) return { name: 'Gold', color: 'bg-[#fbf6ee] text-[#947635]' };
    if (g.bestNormalized >= 50) return { name: 'Silver', color: 'bg-stone-100 text-stone-700' };
    return { name: 'Bronze', color: 'bg-[#f7ece8] text-[#a05c44]' };
  };

  const getFormattedScore = (id: GameId) => {
    const g = stats[id];
    if (g.bestRaw === null) return '--';
    if (id === 'schulte') return `${g.bestRaw}s`;
    if (id === 'reaction') return `${g.bestRaw}ms`;
    if (id === 'simon') return `Lvl ${g.bestRaw}`;
    if (id === 'number') return `${g.bestRaw} digits`;
    return `${g.bestRaw} pts`;
  };

  // Domain scores
  const speedDomain = Math.round(
    (((stats.reaction.bestNormalized || 0) + (stats.schulte.bestNormalized || 0)) /
      (stats.reaction.bestNormalized && stats.schulte.bestNormalized ? 2 : 1)) || 0
  );
  const controlDomain = Math.round(
    (((stats.stroop.bestNormalized || 0) + (stats.arrow.bestNormalized || 0)) /
      (stats.stroop.bestNormalized && stats.arrow.bestNormalized ? 2 : 1)) || 0
  );
  const memoryDomain = Math.round(
    (((stats.simon.bestNormalized || 0) + (stats.number.bestNormalized || 0)) /
      (stats.simon.bestNormalized && stats.number.bestNormalized ? 2 : 1)) || 0
  );
  const vigilanceDomain = Math.round(
    (((stats.cpt.bestNormalized || 0) + (stats.odd.bestNormalized || 0)) /
      (stats.cpt.bestNormalized && stats.odd.bestNormalized ? 2 : 1)) || 0
  );

  const gameKeys: GameId[] = ['schulte', 'stroop', 'arrow', 'reaction', 'simon', 'number', 'odd', 'cpt'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Comprehensive Neuro-Benchmarks
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified performance across cognitive domains, personal bests, and test volume
          </p>
        </div>

        <button
          onClick={onResetStats}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
          <span>Reset Benchmarks</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
            Overall Focus Score
          </span>
          <div className="font-mono font-bold text-3xl text-stone-900 tabular-nums">
            {focusScore} / 100
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Cross-Domain Average</span>
        </div>

        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
            Total Sessions
          </span>
          <div className="font-mono font-bold text-3xl text-[#537158] tabular-nums">
            {totalPlays}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Completed Trials</span>
        </div>

        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
            Active Streak
          </span>
          <div className="font-mono font-bold text-3xl text-[#c9a96e] tabular-nums">
            {streak.count} days
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Continuous Practice</span>
        </div>

        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
            Mastery Ratio
          </span>
          <div className="font-mono font-bold text-3xl text-[#b97359] tabular-nums">
            {Object.values(stats).filter((g) => (g.bestNormalized || 0) >= 70).length} / 8
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Gold / Platinum Badges</span>
        </div>
      </div>

      {/* Domain Proficiency Bars */}
      <div className="p-6 bg-white/95 border border-stone-200/90 rounded-3xl shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold font-serif text-stone-900">
            Cognitive Domain Capacities
          </h3>
          <p className="text-xs text-stone-500">Evaluated against normalized human percentiles</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-800">Processing &amp; Motor Velocity (Reaction, Schulte)</span>
              <span className="font-mono text-[#537158]">{speedDomain}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#537158] rounded-full transition-all duration-700"
                style={{ width: `${speedDomain}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-800">Inhibitory Control &amp; Flexibility (Stroop, Arrow)</span>
              <span className="font-mono text-[#537158]">{controlDomain}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#648896] rounded-full transition-all duration-700"
                style={{ width: `${controlDomain}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-800">Working Memory Span (Sequence, Digits)</span>
              <span className="font-mono text-[#537158]">{memoryDomain}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c9a96e] rounded-full transition-all duration-700"
                style={{ width: `${memoryDomain}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-800">Sustained Vigilance &amp; Anomaly Search (CPT, Odd Out)</span>
              <span className="font-mono text-[#537158]">{vigilanceDomain}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b97359] rounded-full transition-all duration-700"
                style={{ width: `${vigilanceDomain}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Game Records Table */}
      <div className="p-6 bg-white/95 border border-stone-200/90 rounded-3xl shadow-xs overflow-hidden">
        <h3 className="text-base font-bold font-serif text-stone-900 mb-4">
          All-Time Benchmark Directory
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 text-stone-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2 font-semibold">Module</th>
                <th className="py-3 px-2 font-semibold">Trained Faculty</th>
                <th className="py-3 px-2 font-semibold">Personal Record</th>
                <th className="py-3 px-2 font-semibold">Tier</th>
                <th className="py-3 px-2 font-semibold">Sessions</th>
                <th className="py-3 px-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {gameKeys.map((key) => {
                const def = GAME_DEFINITIONS[key];
                const g = stats[key];
                const tier = getTier(key);

                return (
                  <tr key={key} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span>{def.icon}</span>
                        <strong className="text-stone-900">{def.title}</strong>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-stone-500">{def.skillTag}</td>
                    <td className="py-3 px-2 font-mono font-bold text-stone-900">
                      {getFormattedScore(key)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${tier.color}`}>
                        {tier.name}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-stone-600">{g.plays}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => onLaunchGame(key)}
                        className="text-xs font-semibold text-[#537158] hover:text-[#435c46] transition-colors"
                      >
                        Launch ➔
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
