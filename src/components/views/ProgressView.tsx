import React from 'react';
import { GameId, GameStats, SessionRecord, StreakInfo } from '../../types';
import { GAME_DEFINITIONS } from '../../data/games';
import {
  getISOWeekString,
  getWeeklyActivity,
  getMonthlyTrend,
  getDomainScores,
  getGameMetrics,
  calculateFocusScore
} from '../../services/storage';
import { Calendar, TrendingUp, Award, Zap, CheckCircle2 } from 'lucide-react';

interface ProgressViewProps {
  stats: Record<GameId, GameStats>;
  sessions: SessionRecord[];
  streak: StreakInfo;
  onLaunchGame: (id: GameId) => void;
}

export function ProgressView({ stats, sessions, streak, onLaunchGame }: ProgressViewProps) {
  const now = new Date();
  const currentWeek = getISOWeekString(now);
  const currentMonth = now.toISOString().slice(0, 7);

  const thisWeekSessions = sessions.filter((s) => s.week === currentWeek);
  const thisMonthSessions = sessions.filter((s) => s.month === currentMonth);

  const focusScore = calculateFocusScore(stats);

  const weeklyData = getWeeklyActivity(sessions, 7);
  const maxWeeklyCount = Math.max(4, ...weeklyData.map((d) => d.count));

  const monthlyTrend = getMonthlyTrend(sessions, 30);
  const monthlyDataPoints = monthlyTrend.filter((d) => d.hasData);
  const monthlyAvgScore =
    monthlyDataPoints.length > 0
      ? Math.round(monthlyDataPoints.reduce((acc, d) => acc + (d.score || 0), 0) / monthlyDataPoints.length)
      : '--';

  // Domain radar data
  const { personalBest, thisWeek } = getDomainScores(stats, sessions);
  const domainNames = Object.keys(personalBest);
  const totalAxes = domainNames.length;
  const radarCX = 220;
  const radarCY = 180;
  const radarR = 110;

  // Build radar polygons
  const pbPts: string[] = [];
  const weekPts: string[] = [];

  for (let i = 0; i < totalAxes; i++) {
    const angle = (i / totalAxes) * Math.PI * 2 - Math.PI / 2;
    const pbVal = Math.max(0.08, (personalBest[domainNames[i]] || 0) / 100);
    const pbX = radarCX + radarR * pbVal * Math.cos(angle);
    const pbY = radarCY + radarR * pbVal * Math.sin(angle);
    pbPts.push(`${pbX.toFixed(1)},${pbY.toFixed(1)}`);

    const wVal = Math.max(0.05, (thisWeek[domainNames[i]] || 0) / 100);
    const wX = radarCX + radarR * wVal * Math.cos(angle);
    const wY = radarCY + radarR * wVal * Math.sin(angle);
    weekPts.push(`${wX.toFixed(1)},${wY.toFixed(1)}`);
  }

  // Monthly line chart coordinates
  const svgW = 760;
  const svgH = 200;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  let lastKnownScore = focusScore || 50;
  const linePoints: { x: number; y: number; score: number; hasData: boolean; date: string }[] = [];

  monthlyTrend.forEach((d, idx) => {
    const x = padL + (idx / (monthlyTrend.length - 1)) * plotW;
    if (d.hasData && d.score !== null) {
      lastKnownScore = d.score;
    }
    const y = padT + plotH - (lastKnownScore / 100) * plotH;
    linePoints.push({
      x,
      y,
      score: lastKnownScore,
      hasData: d.hasData,
      date: d.dateStr
    });
  });

  const lineCoordsStr = linePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPolygonStr = `${linePoints[0].x},${padT + plotH} ${lineCoordsStr} ${
    linePoints[linePoints.length - 1].x
  },${padT + plotH}`;

  const gameKeys: GameId[] = ['schulte', 'stroop', 'arrow', 'reaction', 'simon', 'number', 'odd', 'cpt'];

  // Achievements
  const allPlayed = Object.values(stats).every((g) => g.plays > 0);
  const achievements = [
    {
      id: 'streak',
      title: '7-Day Mindful Cadence',
      desc: 'Maintain an uninterrupted 7-day training consistency.',
      unlocked: streak.count >= 7,
      progress: `${streak.count} / 7 days`
    },
    {
      id: 'athlete',
      title: 'All-Faculty Scholar',
      desc: 'Exercise all 8 scientific cognitive modules.',
      unlocked: allPlayed,
      progress: allPlayed ? 'Completed' : 'Train remaining games'
    },
    {
      id: 'reflex',
      title: 'Lightning Reflexes',
      desc: 'Record a sub-250ms average in Reaction Velocity.',
      unlocked: Boolean(stats.reaction.bestRaw && stats.reaction.bestRaw < 250),
      progress: stats.reaction.bestRaw ? `${stats.reaction.bestRaw}ms` : 'Unachieved'
    },
    {
      id: 'memory',
      title: 'Digit Master (8+)',
      desc: 'Successfully memorize a digit span of 8 or more items.',
      unlocked: Boolean(stats.number.bestRaw && stats.number.bestRaw >= 8),
      progress: stats.number.bestRaw ? `${stats.number.bestRaw} digits` : 'Unachieved'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
          Performance &amp; Longitudinal Analytics
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Weekly activity, 8-faculty cognitive radar, and progression trajectories
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              This Week
            </span>
            <Calendar className="w-4 h-4 text-[#537158]" />
          </div>
          <div className="font-mono font-bold text-3xl text-stone-900 tabular-nums">
            {thisWeekSessions.length}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Completed Sessions</span>
        </div>

        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              This Month
            </span>
            <TrendingUp className="w-4 h-4 text-[#648896]" />
          </div>
          <div className="font-mono font-bold text-3xl text-stone-900 tabular-nums">
            {thisMonthSessions.length}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Monthly Engagements</span>
        </div>

        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Focus Index
            </span>
            <Zap className="w-4 h-4 text-[#c9a96e]" />
          </div>
          <div className="font-mono font-bold text-3xl text-[#537158] tabular-nums">
            {focusScore}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Composite Score (0-100)</span>
        </div>

        <div className="p-5 bg-white/95 border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Cadence Streak
            </span>
            <Award className="w-4 h-4 text-[#b97359]" />
          </div>
          <div className="font-mono font-bold text-3xl text-[#b97359] tabular-nums">
            {streak.count}d
          </div>
          <span className="text-xs text-stone-500 mt-1 block">Consecutive Days</span>
        </div>
      </div>

      {/* Grid: 7-Day Bar Chart + 8-Faculty Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Bar Chart */}
        <div className="p-6 bg-white/95 border border-stone-200/90 rounded-3xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-serif text-stone-900">
                Daily Activity — Past 7 Days
              </h3>
              <p className="text-[11px] text-stone-500">Sessions exercised per day</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#537158]" /> High Focus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#c9a96e]" /> Steady
              </span>
            </div>
          </div>

          <div className="h-44 w-full flex items-end gap-2 sm:gap-3 pt-4 border-b border-stone-100">
            {weeklyData.map((day) => {
              const heightPct = day.count > 0 ? Math.max(16, (day.count / maxWeeklyCount) * 100) : 8;
              const barColor =
                day.count === 0
                  ? 'bg-stone-100'
                  : day.avgScore >= 70
                  ? 'bg-gradient-to-t from-[#537158] to-[#719077]'
                  : 'bg-gradient-to-t from-[#c9a96e] to-[#dfc491]';

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono text-stone-400 group-hover:text-stone-800 mb-1">
                    {day.count}
                  </span>
                  <div
                    className={`w-full max-w-[34px] rounded-t-lg transition-all duration-500 ${barColor}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className={`text-[10px] mt-2 font-medium ${day.isToday ? 'text-[#537158] font-bold' : 'text-stone-400'}`}>
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cognitive Domain Radar (Interactive SVG) */}
        <div className="p-6 bg-white/95 border border-stone-200/90 rounded-3xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold font-serif text-stone-900">
                Cognitive Domain Radar
              </h3>
              <p className="text-[11px] text-stone-500">Multifaceted proficiency mapping</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium">
              <span className="flex items-center gap-1 text-[#537158]">
                <span className="w-2 h-2 rounded-full bg-[#537158]" /> Personal Best
              </span>
              <span className="flex items-center gap-1 text-[#648896]">
                <span className="w-2 h-2 rounded-full bg-[#648896]" /> This Week
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <svg className="w-full max-w-[380px] h-[260px] overflow-visible" viewBox="0 0 440 360">
              {/* Web Rings */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => {
                const ringPoints = domainNames.map((_, i) => {
                  const angle = (i / totalAxes) * Math.PI * 2 - Math.PI / 2;
                  const x = radarCX + radarR * level * Math.cos(angle);
                  const y = radarCY + radarR * level * Math.sin(angle);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });
                return (
                  <polygon
                    key={level}
                    points={ringPoints.join(' ')}
                    fill="none"
                    stroke="#e8e4dc"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                );
              })}

              {/* Spokes & Text Labels */}
              {domainNames.map((dName, i) => {
                const angle = (i / totalAxes) * Math.PI * 2 - Math.PI / 2;
                const outerX = radarCX + radarR * Math.cos(angle);
                const outerY = radarCY + radarR * Math.sin(angle);

                const labelDist = radarR + 24;
                const lx = radarCX + labelDist * Math.cos(angle);
                const ly = radarCY + labelDist * Math.sin(angle);

                let anchor: 'start' | 'middle' | 'end' = 'middle';
                if (Math.cos(angle) > 0.3) anchor = 'start';
                else if (Math.cos(angle) < -0.3) anchor = 'end';

                return (
                  <g key={dName}>
                    <line
                      x1={radarCX}
                      y1={radarCY}
                      x2={outerX}
                      y2={outerY}
                      stroke="#e8e4dc"
                      strokeWidth="1"
                    />
                    <text
                      x={lx}
                      y={ly + 4}
                      fill="#7a7168"
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor={anchor}
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {dName}
                    </text>
                  </g>
                );
              })}

              {/* Polygons */}
              <polygon
                points={pbPts.join(' ')}
                fill="rgba(83, 113, 88, 0.18)"
                stroke="#537158"
                strokeWidth="2"
              />
              <polygon
                points={weekPts.join(' ')}
                fill="rgba(100, 136, 150, 0.22)"
                stroke="#648896"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* 30-Day Focus Score Progression Trend */}
      <div className="p-6 bg-white/95 border border-stone-200/90 rounded-3xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-serif text-stone-900">
              30-Day Cognitive Progression
            </h3>
            <p className="text-[11px] text-stone-500">Longitudinal index trend</p>
          </div>
          <div className="text-xs text-stone-600">
            30-Day Average: <strong className="font-mono text-stone-900">{monthlyAvgScore} pts</strong>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg className="w-full min-w-[600px] h-48 overflow-visible" viewBox={`0 0 ${svgW} ${svgH}`}>
            <defs>
              <linearGradient id="monthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#537158" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#537158" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[25, 50, 75, 100].map((val) => {
              const y = padT + plotH - (val / 100) * plotH;
              return (
                <g key={val}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={svgW - padR}
                    y2={y}
                    stroke="#f0ece4"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={padL - 8}
                    y={y + 3}
                    fill="#9c948b"
                    fontSize="9"
                    fontFamily="DM Mono, monospace"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Shaded Area */}
            <polygon points={areaPolygonStr} fill="url(#monthAreaGrad)" />

            {/* Line curve */}
            <polyline
              points={lineCoordsStr}
              fill="none"
              stroke="#537158"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots on days with data */}
            {linePoints
              .filter((p) => p.hasData)
              .map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#537158"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                >
                  <title>{`${p.date}: ${p.score} pts`}</title>
                </circle>
              ))}
          </svg>
        </div>
      </div>

      {/* Game-by-Game Sparkline Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold font-serif text-stone-900">
            Module Performance &amp; Sparklines
          </h3>
          <p className="text-xs text-stone-500">Recent trajectories across all 8 cognitive benchmarks</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gameKeys.map((key) => {
            const def = GAME_DEFINITIONS[key];
            const m = getGameMetrics(key, stats, sessions);

            return (
              <div
                key={key}
                onClick={() => onLaunchGame(key)}
                className="p-4 bg-white/95 hover:bg-white border border-stone-200/90 hover:border-[#537158]/40 rounded-2xl shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{def.icon}</span>
                      <span className="text-xs font-bold font-serif text-stone-900 truncate">
                        {def.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        m.trend.status === 'improving'
                          ? 'bg-[#eaf1eb] text-[#3c5541]'
                          : m.trend.status === 'declining'
                          ? 'bg-[#f7ece8] text-[#a05c44]'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {m.trend.text}
                    </span>
                  </div>

                  {/* Sparkline */}
                  <div className="h-8 w-full my-3 flex items-center justify-center bg-stone-50/70 rounded-lg p-1">
                    {m.sparklineScores.length >= 2 ? (
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
                        <polyline
                          points={m.sparklineScores
                            .map((sc, i) => {
                              const x = 5 + (i / (m.sparklineScores.length - 1)) * 90;
                              const y = 20 - (sc / 100) * 16;
                              return `${x.toFixed(1)},${y.toFixed(1)}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#537158"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-medium">
                        Baseline forming
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-stone-400 text-[9px] uppercase tracking-wider block">PB</span>
                    <span className="font-mono font-bold text-stone-800">{m.bestEverStr}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[9px] uppercase tracking-wider block">Sessions</span>
                    <span className="font-mono text-stone-600">{m.totalPlays}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Cognitive Honors */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold font-serif text-stone-900">
            Cognitive Honors &amp; Milestones
          </h3>
          <p className="text-xs text-stone-500">Unlocked through consistent daily neuro-conditioning</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-br from-white to-[#fbf8f0] border-[#c9a96e]/40 shadow-xs'
                  : 'bg-white/60 border-stone-200/70 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🏆</span>
                <span className="text-[10px] font-mono font-bold text-stone-500">
                  {ach.progress}
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 mb-1">{ach.title}</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">{ach.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
