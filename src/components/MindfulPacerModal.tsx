import React, { useState, useEffect } from 'react';
import { X, Sparkles, Eye, Wind, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface MindfulPacerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export function MindfulPacerModal({ isOpen, onClose }: MindfulPacerModalProps) {
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [countdown, setCountdown] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'breath' | 'eyes'>('breath');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // Advance phase
          setPhase((currentPhase) => {
            if (currentPhase === 'Inhale') {
              soundEngine.playGentleChime(440, 0.2);
              return 'Hold';
            }
            if (currentPhase === 'Hold') {
              soundEngine.playGentleChime(392, 0.2);
              return 'Exhale';
            }
            if (currentPhase === 'Exhale') {
              soundEngine.playGentleChime(349, 0.2);
              return 'Rest';
            }
            // Finished a cycle
            setCycleCount((c) => c + 1);
            soundEngine.playGentleChime(523, 0.25);
            return 'Inhale';
          });
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

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

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#eaf1eb] text-[#3c5541] flex items-center justify-center font-bold text-lg">
            🍃
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              Zen Focus &amp; Eye Calmer
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Restore visual clarity &amp; lower prefrontal cognitive strain
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 mb-6 bg-stone-200/50 rounded-xl">
          <button
            onClick={() => setActiveTab('breath')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'breath'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wind className="w-4 h-4 text-[#537158]" />
            Box Breathing Pacer
          </button>
          <button
            onClick={() => setActiveTab('eyes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'eyes'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-4 h-4 text-[#b97359]" />
            20-20-20 Eye Refresh
          </button>
        </div>

        {activeTab === 'breath' ? (
          <div className="flex flex-col items-center justify-center py-4">
            {/* Organic Breathing Orb */}
            <div className="relative flex items-center justify-center w-52 h-52 mb-6">
              {/* Outer soft pulsing ripple */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  phase === 'Inhale' || phase === 'Hold'
                    ? 'scale-110 bg-[#eaf1eb]/80'
                    : 'scale-90 bg-stone-100/60'
                }`}
              />
              {/* Core natural orb */}
              <div
                className={`relative z-10 flex flex-col items-center justify-center w-40 h-40 rounded-full border border-[#537158]/20 shadow-md transition-all duration-1000 ${
                  phase === 'Inhale'
                    ? 'scale-105 bg-gradient-to-tr from-[#eaf1eb] to-[#d6e5d8] text-[#3c5541]'
                    : phase === 'Hold'
                    ? 'scale-105 bg-[#dbe8dc] text-[#3c5541]'
                    : phase === 'Exhale'
                    ? 'scale-90 bg-gradient-to-tr from-[#fbf8f3] to-[#ede8df] text-stone-700'
                    : 'scale-85 bg-[#faf8f5] text-stone-500'
                }`}
              >
                <span className="text-xs uppercase tracking-widest font-semibold opacity-70">
                  {phase}
                </span>
                <span className="text-4xl font-mono font-bold my-1">
                  {countdown}
                </span>
                <span className="text-[11px] text-stone-500">
                  Cycle #{cycleCount + 1}
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-stone-600 max-w-sm leading-relaxed mb-6">
              {phase === 'Inhale' && 'Slowly breathe in through your nose, expanding your belly...'}
              {phase === 'Hold' && 'Gently hold your breath without tension in your neck or chest...'}
              {phase === 'Exhale' && 'Smoothly exhale through your mouth, releasing eye and brow tension...'}
              {phase === 'Rest' && 'Pause naturally in stillness before the next mindful breath...'}
            </p>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sparkles className="w-3.5 h-3.5 text-[#537158]" />
              <span>4-4-4-4 Box Breathing lowers cortisol and sharpens neural focus</span>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-4">
            <div className="p-4 bg-white/90 border border-stone-200/80 rounded-2xl shadow-xs">
              <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#537158]" />
                1. The 20-20-20 Rule
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every 20 minutes of screen work, look at an object at least 20 feet (6 meters) away for 20 seconds. This relaxes the ciliary muscles in your eyes that cause digital fatigue.
              </p>
            </div>

            <div className="p-4 bg-white/90 border border-stone-200/80 rounded-2xl shadow-xs">
              <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#b97359]" />
                2. Warm Palming Technique
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Rub your palms vigorously for 10 seconds until warm, then cup them gently over your closed eyes without touching the eyeballs. Breathe deeply in complete darkness for 30 seconds.
              </p>
            </div>

            <div className="p-4 bg-white/90 border border-stone-200/80 rounded-2xl shadow-xs">
              <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#648896]" />
                3. Gentle Figure-8 Gaze
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Imagine a large horizontal figure-eight about 10 feet in front of you. Slowly trace it with your eyes 5 times in one direction, then reverse.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] rounded-xl transition-all shadow-xs"
          >
            I feel Refreshed, Let's Train ➔
          </button>
        </div>
      </div>
    </div>
  );
}
