export type GameId = 
  | 'schulte'
  | 'stroop'
  | 'arrow'
  | 'reaction'
  | 'simon'
  | 'number'
  | 'odd'
  | 'cpt';

export type GameCategory = 'attention' | 'speed' | 'memory';

export interface GameDefinition {
  id: GameId;
  title: string;
  icon: string;
  category: GameCategory[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skillTag: string;
  shortDesc: string;
  rules: string[];
  cognitiveBenefit: string;
}

export interface SessionRecord {
  sessionId: string;
  gameId: GameId;
  rawScore: number;
  normalizedScore: number; // 0 - 100
  timestamp: number;
  date: string; // YYYY-MM-DD
  week: string; // YYYY-Www
  month: string; // YYYY-MM
  unit: string;
  details?: Record<string, any>;
}

export interface GameStats {
  plays: number;
  lastPlayed: string | null;
  bestRaw: number | null;
  bestNormalized: number | null;
  details?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  isGuest: boolean;
  avatarSeed?: string;
  joinedAt: number;
}

export interface StreakInfo {
  count: number;
  lastDate: string | null;
}

export interface ResultModalData {
  gameId: GameId;
  gameTitle: string;
  scoreText: string;
  metricLabel: string;
  badge: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  percentileText: string;
  barPercent: number;
  cognitiveSkill: string;
  isPB: boolean;
  onPlayAgain: () => void;
}
