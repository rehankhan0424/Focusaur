import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, User, LogOut, RefreshCw, CheckCircle, Flame } from 'lucide-react';
import { UserProfile, StreakInfo } from '../types';
import { soundEngine } from '../services/soundEngine';

interface NavbarProps {
  currentTab: 'home' | 'progress' | 'stats';
  onSelectTab: (tab: 'home' | 'progress' | 'stats') => void;
  onOpenWarmup: () => void;
  onOpenAbout: () => void;
  onOpenAuth: () => void;
  currentUser: UserProfile;
  streak: StreakInfo;
  onSignOut: () => void;
}

export function Navbar({
  currentTab,
  onSelectTab,
  onOpenWarmup,
  onOpenAbout,
  onOpenAuth,
  currentUser,
  streak,
  onSignOut
}: NavbarProps) {
  const [soundOn, setSoundOn] = useState(soundEngine.enabled);
  const [ambientOn, setAmbientOn] = useState(soundEngine.ambientEnabled);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleSound = () => {
    const active = soundEngine.toggleSound();
    setSoundOn(active);
  };

  const handleToggleAmbient = () => {
    const active = soundEngine.toggleAmbientSound();
    setAmbientOn(active);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'FA';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 text-left group whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#537158] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-[#435c46] transition-colors">
            🍃
          </div>
          <span className="text-xl font-bold font-serif tracking-tight text-stone-900">
            Focusaur
          </span>
        </button>

        {/* Zone 2: 4-5 Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
          <button
            onClick={() => onSelectTab('home')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              currentTab === 'home'
                ? 'border-[#537158] text-stone-900'
                : 'border-transparent text-stone-600'
            }`}
          >
            Training Suite
          </button>
          <button
            onClick={() => onSelectTab('progress')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              currentTab === 'progress'
                ? 'border-[#537158] text-stone-900'
                : 'border-transparent text-stone-600'
            }`}
          >
            Analytics &amp; Growth
          </button>
          <button
            onClick={() => onSelectTab('stats')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              currentTab === 'stats'
                ? 'border-[#537158] text-stone-900'
                : 'border-transparent text-stone-600'
            }`}
          >
            Benchmark Records
          </button>
          <button
            onClick={onOpenWarmup}
            className="text-stone-600 hover:text-[#537158] transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#537158]" />
            Zen Eye Calmer
          </button>
          <button
            onClick={onOpenAbout}
            className="text-stone-600 hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Science
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Daily streak */}
          <div
            title="Daily Cognitive Workout Streak"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf6ee] border border-[#c9a96e]/30 rounded-xl text-xs font-bold text-[#947635]"
          >
            <Flame className="w-3.5 h-3.5 text-[#c9a96e] fill-[#c9a96e]" />
            <span className="font-mono tabular-nums">{streak.count}</span>
            <span className="text-[11px] font-medium text-stone-500">days</span>
          </div>

          {/* Audio Chimes toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Sound FX On (Click to mute)' : 'Sound FX Muted (Click to enable)'}
            className={`p-2 rounded-xl border transition-all ${
              soundOn
                ? 'bg-white border-stone-200 text-stone-700 hover:text-stone-900'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
            aria-label="Toggle Sound"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Ambient Rain / Focus Drone toggle */}
          <button
            onClick={handleToggleAmbient}
            title={ambientOn ? 'Ambient Nature Tone Active' : 'Start Soothing Focus Tone'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              ambientOn
                ? 'bg-[#eaf1eb] border-[#537158]/30 text-[#3c5541]'
                : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${ambientOn ? 'animate-pulse text-[#537158]' : ''}`} />
            <span className="text-[11px]">{ambientOn ? 'Nature Hum' : 'Calm Tone'}</span>
          </button>

          {/* User Sign In / Profile dropdown */}
          <div className="relative" ref={menuRef}>
            {currentUser.isGuest ? (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-xs"
                aria-label="User Account"
              >
                <span className="text-xs font-bold text-stone-800 max-w-[90px] truncate hidden sm:inline">
                  {currentUser.displayName}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#537158] text-white flex items-center justify-center text-xs font-bold font-mono">
                  {getInitials(currentUser.displayName)}
                </div>
              </button>
            )}

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 p-3 bg-white border border-stone-200/90 rounded-2xl shadow-xl z-50 text-stone-800 animate-fade-in">
                <div className="px-2 py-2 border-b border-stone-100 mb-2">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {currentUser.email}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#537158] font-medium">
                    <CheckCircle className="w-3 h-3 text-[#537158]" />
                    <span>Cloud Data Synced</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onSelectTab('progress');
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs text-stone-700 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📈</span>
                  <span>Growth &amp; Spider Chart</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onSelectTab('stats');
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs text-stone-700 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Benchmark Scores</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs text-stone-700 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>Switch Account</span>
                </button>

                <div className="my-1.5 border-t border-stone-100" />

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs text-[#a05c44] hover:bg-[#f7ece8] rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
