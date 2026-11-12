import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CycleStats, DayLog, PeriodCycle } from '../types';
import { formatDateKey, getCalendarDayInfo } from '../utils/cycleCalculations';

interface CalendarViewProps {
  cycles: PeriodCycle[];
  dayLogs: Record<string, DayLog>;
  stats: CycleStats;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  cycles,
  dayLogs,
  stats,
  onSelectDate
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="bg-white rounded-3xl p-5 border border-blush-200/80 shadow-soft max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </h2>
          <button
            onClick={goToToday}
            className="text-[11px] text-blush-600 font-semibold hover:underline"
          >
            Сегодня
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-50 hover:bg-blush-50 text-slate-600 hover:text-blush-600 transition-colors"
            title="Предыдущий месяц"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-50 hover:bg-blush-50 text-slate-600 hover:text-blush-600 transition-colors"
            title="Следующий месяц"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayNames.map((name, i) => (
          <div
            key={name}
            className={`text-xs font-semibold py-1 ${
              i >= 5 ? 'text-rosewood-400' : 'text-slate-400'
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateKey = formatDateKey(day);
          const isCurrentMonthDay = isSameMonth(day, currentMonth);
          const isCurrentToday = isToday(day);

          const {
            isPeriod,
            isPredictedPeriod,
            isOvulation,
            isFertile,
            hasLog,
            flowIntensity
          } = getCalendarDayInfo(day, cycles, dayLogs, stats);

          let bgClass = 'bg-transparent text-slate-700 hover:bg-blush-50/70';
          let borderClass = 'border-transparent';

          if (isPeriod) {
            bgClass = 'bg-gradient-to-tr from-blush-500 to-blush-600 text-white font-bold shadow-xs';
          } else if (isPredictedPeriod) {
            bgClass = 'bg-blush-50 text-blush-700 font-medium border-dashed border border-blush-300';
          } else if (isOvulation) {
            bgClass = 'bg-lavender-100 text-lavender-900 font-bold border border-lavender-300';
          } else if (isFertile) {
            bgClass = 'bg-sage-50 text-emerald-800';
          }

          if (isCurrentToday && !isPeriod) {
            borderClass = 'ring-2 ring-blush-400 ring-offset-1';
          }

          if (!isCurrentMonthDay) {
            bgClass = 'bg-transparent text-slate-300 opacity-40';
          }

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 ${bgClass} ${borderClass}`}
            >
              <span className="text-xs leading-none">
                {format(day, 'd')}
              </span>

              <div className="flex items-center space-x-0.5 mt-1 h-1.5">
                {isOvulation && (
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender-500" />
                )}
                {hasLog && !isPeriod && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {isPeriod && flowIntensity && (
                  <span className="w-1 h-1 rounded-full bg-white opacity-80" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-blush-500 to-blush-600 shadow-xs" />
          <span>Месячные</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-md bg-blush-50 border border-dashed border-blush-300" />
          <span>Прогноз месячных</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-md bg-lavender-100 border border-lavender-300" />
          <span>День овуляции</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-md bg-sage-50 border border-sage-200" />
          <span>Окно фертильности</span>
        </div>
        <div className="flex items-center space-x-2 col-span-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Есть заметки или симптомы</span>
        </div>
      </div>
    </div>
  );
};
