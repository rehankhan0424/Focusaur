import React from 'react';
import { X, Sparkles, Brain, Clock, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-7 bg-[#faf8f5] border border-stone-200/90 rounded-3xl shadow-2xl text-stone-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/70 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#eaf1eb] text-[#3c5541] flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              The Science of Focusaur
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Neuroplastic attention conditioning &amp; digital fatigue recovery
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-stone-600 leading-relaxed">
          <p>
            <strong>Focusaur</strong> is an evidence-grounded cognitive training environment designed to combat digital attention fragmentation. Modern screen environments constantly trigger dopamine-driven task switching, degrading sustained executive control.
          </p>

          <div className="p-4 bg-white/90 border border-stone-200/80 rounded-2xl space-y-3">
            <div className="flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-[#537158] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">1. Executive Inhibitory Control</span>
                <span>The Stroop and Arrow Inversion tasks stimulate the anterior cingulate cortex (ACC) and dorsolateral prefrontal cortex (DLPFC) to inhibit habitual impulses.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#b97359] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">2. Sustained Vigilance (d&apos; Sensitivity)</span>
                <span>The Continuous Performance Task (CPT) measures how well you maintain vigilance without attentional drift over 60 continuous seconds.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#648896] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">3. Calming, Non-Addictive Aesthetics</span>
                <span>Unlike gamified apps that use flashing neon lights and hyperactive sounds, Focusaur uses organic stone tones, soft natural greens, and warm audio frequencies that soothe your optic nerves while challenging your mind.</span>
              </div>
            </div>
          </div>

          <p>
            <strong>Recommended Dosage:</strong> 5 to 10 minutes of diverse training each day is sufficient to trigger neuroplastic adaptations without creating visual burnout.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] rounded-xl transition-all shadow-xs"
          >
            Understood, Let&apos;s Train ➔
          </button>
        </div>
      </div>
    </div>
  );
}
