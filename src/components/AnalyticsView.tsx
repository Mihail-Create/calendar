import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Activity,
  Plus,
  Trash2,
  CalendarRange,
  Info
} from 'lucide-react';
import type { CycleStats, PeriodCycle } from '../types';
import { formatReadableDate } from '../utils/cycleCalculations';

interface AnalyticsViewProps {
  cycles: PeriodCycle[];
  stats: CycleStats;
  onAddCycle: (startDate: string, endDate?: string) => Promise<void>;
  onDeleteCycle: (cycleId: string) => Promise<void>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  cycles,
  stats,
  onAddCycle,
  onDeleteCycle
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEndDate, setNewEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedCycles = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate) return;

    setIsSubmitting(true);
    await onAddCycle(newStartDate, newEndDate || undefined);
    setIsSubmitting(false);
    setShowAddModal(false);
    setNewEndDate('');
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-blush-100 shadow-soft">
          <div className="w-8 h-8 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Длина цикла
          </span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-2xl font-black text-slate-800">
              {stats.avgCycleLength}
            </span>
            <span className="text-xs font-semibold text-slate-400">дней</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">в среднем по истории</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-blush-100 shadow-soft">
          <div className="w-8 h-8 rounded-xl bg-peach-50 text-peach-600 flex items-center justify-center mb-2">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Месячные
          </span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-2xl font-black text-slate-800">
              {stats.avgPeriodLength}
            </span>
            <span className="text-xs font-semibold text-slate-400">дней</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">длительность периода</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
          <CalendarRange className="w-4 h-4 text-blush-500" />
          <span>История циклов ({cycles.length})</span>
        </h3>

        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs font-semibold text-blush-600 bg-blush-50 hover:bg-blush-100 px-3 py-1.5 rounded-full flex items-center space-x-1 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить</span>
        </button>
      </div>

      {sortedCycles.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 text-center border border-blush-100 shadow-soft">
          <div className="w-12 h-12 rounded-full bg-blush-50 text-blush-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 mb-1">Пока нет записей</h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-4">
            Отметь первый день цикла на главной или добавь прошедшие даты, чтобы включить умный прогноз.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-blush-500 text-white shadow-soft"
          >
            Добавить первый цикл
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedCycles.map((cycle, idx) => {
            return (
              <div
                key={cycle.id}
                className="bg-white rounded-2xl p-4 border border-blush-100/80 shadow-xs flex items-center justify-between hover:border-blush-200 transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blush-500" />
                    <span className="text-sm font-bold text-slate-800">
                      {formatReadableDate(cycle.startDate, 'd MMMM yyyy')}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] bg-blush-100 text-blush-700 font-bold px-1.5 py-0.5 rounded-full">
                        Текущий
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    {cycle.endDate ? (
                      <span>до {formatReadableDate(cycle.endDate, 'd MMMM')}</span>
                    ) : (
                      <span className="text-blush-600 font-medium">Продолжается</span>
                    )}
                    {cycle.durationDays && (
                      <span>• {cycle.durationDays} дн. выделений</span>
                    )}
                    {cycle.cycleLength && (
                      <span>• Цикл {cycle.cycleLength} дн.</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Удалить эту запись цикла?')) {
                      onDeleteCycle(cycle.id);
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Удалить цикл"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blush-50/70 rounded-2xl p-3.5 border border-blush-100 flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
        <Info className="w-4 h-4 text-blush-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-700 block mb-0.5">О точности прогноза</strong>
          Чем регулярнее вы отмечаете даты начала месячных, тем точнее календарь подстраивается под персональный ритм организма.
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-blush-100">
            <h3 className="text-base font-bold text-slate-800 mb-3">
              Добавить цикл вручную
            </h3>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Дата начала месячных *
                </label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Дата окончания (необязательно)
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  min={newStartDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-white bg-blush-500 hover:bg-blush-600 text-xs font-semibold shadow-soft transition-colors"
                >
                  {isSubmitting ? 'Добавление...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
