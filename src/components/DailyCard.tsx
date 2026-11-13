import React, { useState } from 'react';
import { Sparkles, Heart, Compass, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getDailyAffirmation, PHASE_SPECIFIC_TIPS } from '../utils/affirmations';
import type { CyclePhase } from '../types';

interface DailyCardProps {
  currentPhase: CyclePhase;
}

export const DailyCard: React.FC<DailyCardProps> = ({ currentPhase }) => {
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'compliment' | 'prediction' | 'care'>('compliment');

  const message = getDailyAffirmation(undefined, seedOffset);
  const phaseTip = PHASE_SPECIFIC_TIPS[currentPhase];

  const handleNextMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSeedOffset((prev) => prev + 1);

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.3 },
      colors: ['#ff7e95', '#ffd6dc', '#ffc1a1', '#d7beed'],
      ticks: 120,
      gravity: 0.8,
      scalar: 0.8
    });
  };

  return (
    <div className="bg-gradient-to-br from-white via-blush-50/70 to-peach-50/50 rounded-3xl p-5 border border-blush-200/80 shadow-soft relative overflow-hidden transition-all duration-300">
      <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-blush-200/40 blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-peach-200/30 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{message.icon}</span>
          <span className="text-xs font-semibold tracking-wider uppercase text-blush-600">
            Послание дня
          </span>
        </div>

        <button
          onClick={handleNextMessage}
          className="group flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-blush-200 text-xs text-blush-700 font-medium hover:bg-blush-100/60 transition-all active:scale-95 shadow-sm"
          title="Получить другое предсказание"
        >
          <Sparkles className="w-3.5 h-3.5 text-blush-500 group-hover:rotate-12 transition-transform" />
          <span>Ещё</span>
        </button>
      </div>

      <div className="flex space-x-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-blush-100 mb-3 relative z-10">
        <button
          onClick={() => setActiveTab('compliment')}
          className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'compliment'
              ? 'bg-blush-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-blush-600'
          }`}
        >
          <Heart className="w-3 h-3" />
          <span>Комплимент</span>
        </button>

        <button
          onClick={() => setActiveTab('prediction')}
          className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'prediction'
              ? 'bg-blush-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-blush-600'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span>Предсказание</span>
        </button>

        <button
          onClick={() => setActiveTab('care')}
          className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'care'
              ? 'bg-blush-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-blush-600'
          }`}
        >
          <Smile className="w-3 h-3" />
          <span>Забота</span>
        </button>
      </div>

      <div className="relative z-10 min-h-[72px] flex items-center">
        {activeTab === 'compliment' && (
          <p className="text-slate-700 text-sm sm:text-base font-normal leading-relaxed italic animate-fade-in">
            «{message.compliment}»
          </p>
        )}

        {activeTab === 'prediction' && (
          <div className="space-y-1 animate-fade-in">
            <p className="text-slate-700 text-sm sm:text-base font-normal leading-relaxed">
              ✨ {message.prediction}
            </p>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="space-y-1 animate-fade-in">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-rosewood-700">
              <span>{phaseTip.icon}</span>
              <span>{phaseTip.title}</span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {phaseTip.hint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
