import { GameId, GameStats, SessionRecord, StreakInfo, UserProfile } from '../types';

const STORAGE_KEY_STATS = 'focusaur_stats_v2';
const STORAGE_KEY_STREAK = 'focusaur_streak_v2';
const STORAGE_KEY_SESSIONS = 'focusaur_sessions_v2';
const STORAGE_KEY_USER = 'focusaur_user_v2';

export function getISOWeekString(date: Date): string {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
  return `${target.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function loadStoredUser(): UserProfile {
  const raw = localStorage.getItem(STORAGE_KEY_USER);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  // Default guest profile
  return {
    id: 'guest_' + Math.random().toString(36).substring(2, 9),
    displayName: 'Mindful Athlete',
    email: 'guest@focusaur.app',
    isGuest: true,
    joinedAt: Date.now()
  };
}

export function saveStoredUser(user: UserProfile) {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

export function loadAllStats(): Record<GameId, GameStats> {
  const raw = localStorage.getItem(STORAGE_KEY_STATS);
  const defaultStats: Record<GameId, GameStats> = {
    schulte: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null },
    stroop: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null },
    arrow: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null },
    reaction: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null },
    simon: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null },
    number: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null },
    odd: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null },
    cpt: { plays: 0, lastPlayed: null, bestRaw: null, bestNormalized: null }
  };

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return { ...defaultStats, ...parsed };
    } catch (e) {}
  }
  return defaultStats;
}

export function saveAllStats(stats: Record<GameId, GameStats>) {
  localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
}

export function loadStreak(): StreakInfo {
  const raw = localStorage.getItem(STORAGE_KEY_STREAK);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return { count: 0, lastDate: null };
}

export function saveStreak(streak: StreakInfo) {
  localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(streak));
}

export function loadSessions(): SessionRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return [];
}

export function saveSessions(sessions: SessionRecord[]) {
  // Keep up to 200 sessions
  const trimmed = sessions.length > 200 ? sessions.slice(-200) : sessions;
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(trimmed));
}

export function recordSessionPlay(
  gameId: GameId,
  rawScore: number,
  normalizedScore: number,
  unit: string,
  details?: Record<string, any>
): { isPB: boolean; stats: Record<GameId, GameStats>; streak: StreakInfo } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekStr = getISOWeekString(now);
  const monthStr = now.toISOString().slice(0, 7);

  // Update streak
  const streak = loadStreak();
  if (!streak.lastDate) {
    streak.count = 1;
    streak.lastDate = todayStr;
  } else if (streak.lastDate !== todayStr) {
    const last = new Date(streak.lastDate);
    const curr = new Date(todayStr);
    const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      streak.count += 1;
    } else if (diffDays > 1) {
      streak.count = 1;
    }
    streak.lastDate = todayStr;
  }
  saveStreak(streak);

  // Update Game Stats & check PB
  const stats = loadAllStats();
  const g = stats[gameId];
  g.plays += 1;
  g.lastPlayed = todayStr;

  let isPB = false;
  if (g.bestNormalized === null || normalizedScore > g.bestNormalized) {
    g.bestNormalized = normalizedScore;
    g.bestRaw = rawScore;
    isPB = true;
  }
  if (details) {
    g.details = { ...g.details, ...details };
  }
  saveAllStats(stats);

  // Append session
  const sessions = loadSessions();
  const newSession: SessionRecord = {
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    gameId,
    rawScore,
    normalizedScore,
    timestamp: Date.now(),
    date: todayStr,
    week: weekStr,
    month: monthStr,
    unit,
    details
  };
  sessions.push(newSession);
  saveSessions(sessions);

  return { isPB, stats, streak };
}

export function calculateFocusScore(stats: Record<GameId, GameStats>): number {
  let count = 0;
  let sum = 0;
  for (const k in stats) {
    const g = stats[k as GameId];
    if (g.bestNormalized !== null && g.bestNormalized > 0) {
      sum += g.bestNormalized;
      count += 1;
    }
  }
  if (count === 0) return 0;
  return Math.round(sum / count);
}

export function getTotalPlays(stats: Record<GameId, GameStats>): number {
  return Object.values(stats).reduce((acc, curr) => acc + curr.plays, 0);
}

export function getWeeklyActivity(sessions: SessionRecord[], days = 7) {
  const result = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = new Date().toISOString().slice(0, 10);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = dayNames[d.getDay()];
    const dayNumber = d.getDate();

    const daySessions = sessions.filter(s => s.date === dateStr);
    const count = daySessions.length;
    const avgScore = count > 0
      ? Math.round(daySessions.reduce((sum, s) => sum + s.normalizedScore, 0) / count)
      : 0;

    result.push({
      dateStr,
      dayLabel: `${dayName} ${dayNumber}`,
      isToday: dateStr === todayStr,
      count,
      avgScore
    });
  }
  return result;
}

export function getMonthlyTrend(sessions: SessionRecord[], days = 30) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const daySessions = sessions.filter(s => s.date === dateStr);

    let score = null;
    if (daySessions.length > 0) {
      score = Math.round(daySessions.reduce((sum, s) => sum + s.normalizedScore, 0) / daySessions.length);
    }

    result.push({
      dateStr,
      day: d.getDate(),
      score,
      hasData: daySessions.length > 0
    });
  }
  return result;
}

export function getDomainScores(stats: Record<GameId, GameStats>, sessions: SessionRecord[]) {
  const personalBest: Record<string, number> = {
    'Processing Speed': stats.reaction.bestNormalized || 0,
    'Inhibitory Control': stats.stroop.bestNormalized || 0,
    'Cognitive Flexibility': stats.arrow.bestNormalized || 0,
    'Peripheral Search': stats.schulte.bestNormalized || 0,
    'Visuospatial Memory': stats.simon.bestNormalized || 0,
    'Digit Span': stats.number.bestNormalized || 0,
    'Visual Discrimination': stats.odd.bestNormalized || 0,
    'Sustained Vigilance': stats.cpt.bestNormalized || 0
  };

  const currentWeek = getISOWeekString(new Date());
  const weekSessions = sessions.filter(s => s.week === currentWeek);

  const getWeekAvg = (id: GameId) => {
    const matched = weekSessions.filter(s => s.gameId === id);
    if (matched.length === 0) return 0;
    return Math.round(matched.reduce((a, b) => a + b.normalizedScore, 0) / matched.length);
  };

  const thisWeek: Record<string, number> = {
    'Processing Speed': getWeekAvg('reaction'),
    'Inhibitory Control': getWeekAvg('stroop'),
    'Cognitive Flexibility': getWeekAvg('arrow'),
    'Peripheral Search': getWeekAvg('schulte'),
    'Visuospatial Memory': getWeekAvg('simon'),
    'Digit Span': getWeekAvg('number'),
    'Visual Discrimination': getWeekAvg('odd'),
    'Sustained Vigilance': getWeekAvg('cpt')
  };

  return { personalBest, thisWeek };
}

export function getGameMetrics(gameId: GameId, stats: Record<GameId, GameStats>, sessions: SessionRecord[]) {
  const g = stats[gameId];
  const gameSessions = sessions.filter(s => s.gameId === gameId);
  const currentWeek = getISOWeekString(new Date());
  const currentMonth = new Date().toISOString().slice(0, 7);

  let bestEverStr = '--';
  if (g.bestRaw !== null) {
    if (gameId === 'schulte') bestEverStr = `${g.bestRaw}s`;
    else if (gameId === 'reaction') bestEverStr = `${g.bestRaw}ms`;
    else if (gameId === 'simon') bestEverStr = `Lvl ${g.bestRaw}`;
    else if (gameId === 'number') bestEverStr = `${g.bestRaw} digits`;
    else bestEverStr = `${g.bestRaw} pts`;
  }

  const weekSessions = gameSessions.filter(s => s.week === currentWeek);
  let thisWeekStr = '--';
  if (weekSessions.length > 0) {
    if (gameId === 'schulte') {
      const min = Math.min(...weekSessions.map(s => s.rawScore));
      thisWeekStr = `${min}s`;
    } else if (gameId === 'reaction') {
      const min = Math.min(...weekSessions.map(s => s.rawScore));
      thisWeekStr = `${min}ms`;
    } else if (gameId === 'simon') {
      const max = Math.max(...weekSessions.map(s => s.rawScore));
      thisWeekStr = `Lvl ${max}`;
    } else if (gameId === 'number') {
      const max = Math.max(...weekSessions.map(s => s.rawScore));
      thisWeekStr = `${max} dig`;
    } else {
      const max = Math.max(...weekSessions.map(s => s.rawScore));
      thisWeekStr = `${max} pts`;
    }
  }

  const monthSessions = gameSessions.filter(s => s.month === currentMonth);
  let thisMonthStr = '--';
  if (monthSessions.length > 0) {
    if (gameId === 'schulte') {
      const min = Math.min(...monthSessions.map(s => s.rawScore));
      thisMonthStr = `${min}s`;
    } else if (gameId === 'reaction') {
      const min = Math.min(...monthSessions.map(s => s.rawScore));
      thisMonthStr = `${min}ms`;
    } else if (gameId === 'simon') {
      const max = Math.max(...monthSessions.map(s => s.rawScore));
      thisMonthStr = `Lvl ${max}`;
    } else if (gameId === 'number') {
      const max = Math.max(...monthSessions.map(s => s.rawScore));
      thisMonthStr = `${max} dig`;
    } else {
      const max = Math.max(...monthSessions.map(s => s.rawScore));
      thisMonthStr = `${max} pts`;
    }
  }

  let trend = { status: 'baseline', text: 'Baseline', percent: 0 };
  if (gameSessions.length >= 3) {
    const firstScores = gameSessions.slice(0, 2).map(s => s.normalizedScore);
    const recentScores = gameSessions.slice(-2).map(s => s.normalizedScore);
    const firstAvg = firstScores.reduce((a, b) => a + b, 0) / firstScores.length;
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const diff = Math.round(recentAvg - firstAvg);

    if (diff >= 4) {
      trend = { status: 'improving', text: `+${diff}%`, percent: diff };
    } else if (diff <= -4) {
      trend = { status: 'declining', text: `${diff}%`, percent: diff };
    } else {
      trend = { status: 'stable', text: 'Stable', percent: 0 };
    }
  }

  const sparklineScores = gameSessions.slice(-10).map(s => s.normalizedScore);

  return {
    bestEverStr,
    thisWeekStr,
    thisMonthStr,
    trend,
    sparklineScores,
    totalPlays: g.plays
  };
}

export function resetAllStorage() {
  localStorage.removeItem(STORAGE_KEY_STATS);
  localStorage.removeItem(STORAGE_KEY_STREAK);
  localStorage.removeItem(STORAGE_KEY_SESSIONS);
}
