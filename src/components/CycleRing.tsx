import React from 'react';
import { Droplet, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CycleStats } from '../types';

interface CycleRingProps {
  stats: CycleStats;
  isPeriodActive: boolean;
  onTogglePeriod: () => void;
  onOpenCalendar: () => void;
}

export const CycleRing: React.FC<CycleRingProps> = ({
  stats,
  isPeriodActive,
  onTogglePeriod,
  onOpenCalendar
}) => {
  const {
    hasData,
    currentCycleDay,
    currentPhase,
    phaseTitle,
    phaseDescription,
    daysUntilNextPeriod,
    isDelay,
    delayDays,
    pregnancyChance,
    avgCycleLength
  } = stats;

  const handlePeriodAction = () => {
    if (!isPeriodActive) {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fda4af', '#fecdd3']
      });
    }
    onTogglePeriod();
  };

  const phaseColors = {
    menstrual: {
      ring: 'from-blush-400 to-blush-600',
      badgeBg: 'bg-blush-100 text-blush-700 border-blush-200',
      heroAccent: 'text-blush-600',
      glow: 'shadow-[0_0_40px_rgba(244,67,105,0.18)]'
    },
    follicular: {
      ring: 'from-peach-300 to-peach-500',
      badgeBg: 'bg-peach-100 text-peach-700 border-peach-200',
      heroAccent: 'text-peach-600',
      glow: 'shadow-[0_0_40px_rgba(255,155,109,0.18)]'
    },
    ovulation: {
      ring: 'from-lavender-400 to-blush-400',
      badgeBg: 'bg-lavender-100 text-lavender-700 border-lavender-200',
      heroAccent: 'text-lavender-600',
      glow: 'shadow-[0_0_40px_rgba(189,150,225,0.22)]'
    },
    luteal: {
      ring: 'from-rosewood-300 to-blush-400',
      badgeBg: 'bg-rosewood-100 text-rosewood-700 border-rosewood-200',
      heroAccent: 'text-rosewood-600',
      glow: 'shadow-[0_0_40px_rgba(197,132,118,0.18)]'
    }
  }[currentPhase];

  const progressPercent = hasData
    ? Math.min(100, Math.round((currentCycleDay / (avgCycleLength || 28)) * 100))
    : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
        <div className={`absolute inset-4 rounded-full bg-white ${phaseColors.glow} border border-blush-100/60 transition-all duration-700`} />

        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r={radius}
            stroke="#fce7ea"
            strokeWidth="10"
            fill="transparent"
            strokeLinecap="round"
          />
          <circle
            cx="120"
            cy="120"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7e95" />
              <stop offset="100%" stopColor="#f44369" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border mb-1.5 transition-colors ${phaseColors.badgeBg}`}
          >
            {phaseTitle}
          </span>

          {hasData ? (
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
                {currentCycleDay}
              </span>
              <span className="text-sm font-semibold text-slate-400">день</span>
            </div>
          ) : (
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
                —
              </span>
            </div>
          )}

          <div className="mt-1">
            {!hasData ? (
              <span className="text-xs font-medium text-slate-400">
                Укажи начало цикла
              </span>
            ) : isPeriodActive ? (
              <span className="text-xs font-medium text-blush-600 flex items-center justify-center space-x-1">
                <Droplet className="w-3.5 h-3.5 fill-blush-500 text-blush-500 animate-bounce" />
                <span>Идут месячные</span>
              </span>
            ) : isDelay ? (
              <span className="text-xs font-semibold text-amber-600">
                Задержка {delayDays} {delayDays === 1 ? 'день' : delayDays < 5 ? 'дня' : 'дней'}
              </span>
            ) : daysUntilNextPeriod === 0 ? (
              <span className="text-xs font-semibold text-blush-600">Ожидаются сегодня</span>
            ) : (
              <span className="text-xs font-medium text-slate-500">
                До месячных: <strong className="text-slate-700 font-semibold">{daysUntilNextPeriod} дн.</strong>
              </span>
            )}
          </div>

          <div className="mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/60 text-slate-500 font-medium">
            Шанс зачатия:{' '}
            <span
              className={
                pregnancyChance === 'Пик овуляции' || pregnancyChance === 'Высокая'
                  ? 'text-blush-600 font-bold'
                  : 'text-slate-700'
              }
            >
              {pregnancyChance}
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs sm:text-sm text-slate-500 max-w-xs mb-5 px-4 leading-relaxed">
        {phaseDescription}
      </p>

      <div className="w-full max-w-sm flex items-center space-x-2.5 px-4">
        <button
          onClick={handlePeriodAction}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-soft transition-all active:scale-95 ${
            isPeriodActive
              ? 'bg-white border-2 border-blush-400 text-blush-600 hover:bg-blush-50'
              : 'bg-gradient-to-r from-blush-500 to-blush-600 text-white hover:brightness-105'
          }`}
        >
          <Droplet
            className={`w-4 h-4 ${isPeriodActive ? 'fill-blush-500' : 'fill-white'}`}
          />
          <span>{isPeriodActive ? 'Завершить месячные' : 'Отметить месячные'}</span>
        </button>

        <button
          onClick={onOpenCalendar}
          className="p-3.5 rounded-2xl bg-white border border-blush-200 text-slate-700 shadow-soft hover:bg-blush-50/50 transition-all active:scale-95"
          title="Открыть календарь"
        >
          <Calendar className="w-5 h-5 text-blush-600" />
        </button>
      </div>
    </div>
  );
};
