import React, { useState, useEffect } from 'react';
import { GameId, GameStats, SessionRecord, StreakInfo, UserProfile, ResultModalData } from './types';
import { GAME_DEFINITIONS } from './data/games';
import {
  loadAllStats,
  loadSessions,
  loadStreak,
  loadStoredUser,
  resetAllStorage
} from './services/storage';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/views/HomeView';
import { ProgressView } from './components/views/ProgressView';
import { StatsView } from './components/views/StatsView';
import { ActiveGameView } from './components/views/ActiveGameView';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ResultModal } from './components/ResultModal';
import { MindfulPacerModal } from './components/MindfulPacerModal';
import { AboutModal } from './components/AboutModal';
import { AuthModal } from './components/AuthModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'progress' | 'stats' | 'game'>('home');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);

  const [stats, setStats] = useState<Record<GameId, GameStats>>(() => loadAllStats());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => loadSessions());
  const [streak, setStreak] = useState<StreakInfo>(() => loadStreak());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => loadStoredUser());

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [targetGameForModal, setTargetGameForModal] = useState<GameId | null>(null);
  const [resultModalData, setResultModalData] = useState<ResultModalData | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const refreshAllState = () => {
    setStats(loadAllStats());
    setSessions(loadSessions());
    setStreak(loadStreak());
  };

  const handleLaunchGame = (id: GameId) => {
    setTargetGameForModal(id);
    setIsHowToPlayOpen(true);
  };

  const startActualGame = (id: GameId) => {
    setIsHowToPlayOpen(false);
    setActiveGameId(id);
    setCurrentTab('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGameFinish = (result: ResultModalData) => {
    refreshAllState();
    setResultModalData(result);
    if (result.isPB || result.badge === 'Platinum' || result.badge === 'Gold') {
      setConfettiTrigger((prev) => prev + 1);
    }
  };

  const handleResetStats = () => {
    if (window.confirm('Are you sure you wish to reset all saved cognitive benchmarks, session histories, and streaks?')) {
      resetAllStorage();
      refreshAllState();
    }
  };

  const handleSignOut = () => {
    // Return to guest mode
    const guestUser: UserProfile = {
      id: `guest_${Date.now()}`,
      displayName: 'Guest Athlete',
      email: 'guest@focusaur.app',
      isGuest: true,
      joinedAt: Date.now()
    };
    setCurrentUser(guestUser);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-800 natural-paper-bg selection:bg-[#537158]/20 selection:text-stone-900">
      
      {/* Soothing organic ambient orbs in background */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#537158]/5 blur-3xl pointer-events-none animate-natural-breathe" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[450px] h-[450px] rounded-full bg-[#b97359]/4 blur-3xl pointer-events-none animate-natural-breathe-delayed" />

      {/* Confetti celebration canvas */}
      <ConfettiCanvas triggerKey={confettiTrigger} />

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab === 'game' ? 'home' : currentTab}
        onSelectTab={(tab) => {
          setActiveGameId(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWarmup={() => setIsWarmupModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        streak={streak}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {currentTab === 'home' && (
          <HomeView
            stats={stats}
            streak={streak}
            onLaunchGame={handleLaunchGame}
            onOpenWarmup={() => setIsWarmupModalOpen(true)}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            stats={stats}
            sessions={sessions}
            streak={streak}
            onLaunchGame={handleLaunchGame}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            stats={stats}
            streak={streak}
            onLaunchGame={handleLaunchGame}
            onResetStats={handleResetStats}
          />
        )}

        {currentTab === 'game' && activeGameId && (
          <ActiveGameView
            gameId={activeGameId}
            definition={GAME_DEFINITIONS[activeGameId]}
            onFinish={handleGameFinish}
            onExit={() => {
              setActiveGameId(null);
              setCurrentTab('home');
            }}
            onOpenHelp={() => {
              setTargetGameForModal(activeGameId);
              setIsHowToPlayOpen(true);
            }}
          />
        )}
      </main>

      {/* Minimalist Footprint Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-[#faf8f5]/90 py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-serif font-semibold text-stone-800">
            <span>🍃</span>
            <span>Focusaur Cognitive Suite</span>
          </div>

          <div className="flex items-center gap-3 text-stone-400">
            <span>Science-backed prefrontal training</span>
            <span aria-hidden="true">&bull;</span>
            <span>Zero-eye-strain organic design</span>
            <span aria-hidden="true">&bull;</span>
            <span>Local privacy guaranteed</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HowToPlayModal
        game={targetGameForModal ? GAME_DEFINITIONS[targetGameForModal] : null}
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onStart={() => {
          if (targetGameForModal) {
            startActualGame(targetGameForModal);
          }
        }}
      />

      <ResultModal
        data={resultModalData}
        isOpen={Boolean(resultModalData)}
        onClose={() => setResultModalData(null)}
        onExitToMenu={() => {
          setResultModalData(null);
          setActiveGameId(null);
          setCurrentTab('home');
        }}
      />

      <MindfulPacerModal
        isOpen={isWarmupModalOpen}
        onClose={() => setIsWarmupModalOpen(false)}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChange={(newUser) => setCurrentUser(newUser)}
        currentUser={currentUser}
      />
    </div>
  );
}
