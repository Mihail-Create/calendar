import React, { useState, useEffect } from 'react';
import { X, Droplet, Trash2, Check } from 'lucide-react';
import type { DayLog, FlowIntensity, MoodType, SexActivity, SymptomType } from '../types';
import { formatReadableDate } from '../utils/cycleCalculations';

interface DayLogModalProps {
  dateStr: string | null;
  initialLog?: DayLog;
  onClose: () => void;
  onSave: (log: DayLog) => Promise<void>;
  onDelete: (dateStr: string) => Promise<void>;
}

const SYMPTOM_OPTIONS: { id: SymptomType; label: string; icon: string }[] = [
  { id: 'cramps', label: 'Спазмы', icon: '⚡' },
  { id: 'headache', label: 'Головная боль', icon: '🤕' },
  { id: 'tender_breasts', label: 'Грудь', icon: '🍈' },
  { id: 'bloating', label: 'Вздутие', icon: '🎈' },
  { id: 'fatigue', label: 'Усталость', icon: '😴' },
  { id: 'backache', label: 'Поясница', icon: '🧘‍♀️' },
  { id: 'acne', label: 'Высыпания', icon: '✨' },
  { id: 'cravings', label: 'Тяга к сладкому', icon: '🍫' },
  { id: 'nausea', label: 'Тошнота', icon: '🤢' },
  { id: 'insomnia', label: 'Бессонница', icon: '🌙' },
];

const MOOD_OPTIONS: { id: MoodType; label: string; icon: string }[] = [
  { id: 'happy', label: 'Радостное', icon: '🥰' },
  { id: 'calm', label: 'Спокойное', icon: '😌' },
  { id: 'energetic', label: 'Энергичное', icon: '⚡' },
  { id: 'romantic', label: 'Романтичное', icon: '💖' },
  { id: 'sensitive', label: 'Ранимое', icon: '🥺' },
  { id: 'irritated', label: 'Раздраженное', icon: '😤' },
  { id: 'anxious', label: 'Тревожное', icon: '😰' },
  { id: 'sad', label: 'Грустное', icon: '🌧️' },
];

const FLOW_OPTIONS: { id: FlowIntensity; label: string; drops: number }[] = [
  { id: 'none', label: 'Нет', drops: 0 },
  { id: 'spotting', label: 'Мажущие', drops: 1 },
  { id: 'light', label: 'Легкие', drops: 2 },
  { id: 'medium', label: 'Средние', drops: 3 },
  { id: 'heavy', label: 'Обильные', drops: 4 },
];

const SEX_OPTIONS: { id: SexActivity; label: string; icon: string }[] = [
  { id: 'none', label: 'Не было', icon: '✕' },
  { id: 'protected', label: 'С защитой', icon: '🛡️' },
  { id: 'unprotected', label: 'Без защиты', icon: '❤️' },
  { id: 'high_libido', label: 'Высокое либидо', icon: '🔥' },
];

export const DayLogModal: React.FC<DayLogModalProps> = ({
  dateStr,
  initialLog,
  onClose,
  onSave,
  onDelete
}) => {
  if (!dateStr) return null;

  const [isPeriod, setIsPeriod] = useState<boolean>(initialLog?.isPeriod || false);
  const [flow, setFlow] = useState<FlowIntensity>(initialLog?.flowIntensity || 'none');
  const [symptoms, setSymptoms] = useState<SymptomType[]>(initialLog?.symptoms || []);
  const [moods, setMoods] = useState<MoodType[]>(initialLog?.moods || []);
  const [sex, setSex] = useState<SexActivity>(initialLog?.sexActivity || 'none');
  const [notes, setNotes] = useState<string>(initialLog?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsPeriod(initialLog?.isPeriod || false);
    setFlow(initialLog?.flowIntensity || (initialLog?.isPeriod ? 'medium' : 'none'));
    setSymptoms(initialLog?.symptoms || []);
    setMoods(initialLog?.moods || []);
    setSex(initialLog?.sexActivity || 'none');
    setNotes(initialLog?.notes || '');
  }, [initialLog, dateStr]);

  const toggleSymptom = (sym: SymptomType) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const toggleMood = (m: MoodType) => {
    setMoods((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const handleFlowSelect = (selected: FlowIntensity) => {
    setFlow(selected);
    if (selected === 'none') {
      setIsPeriod(false);
    } else {
      setIsPeriod(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newLog: DayLog = {
      date: dateStr,
      isPeriod: isPeriod || flow !== 'none',
      flowIntensity: flow,
      symptoms,
      moods,
      sexActivity: sex,
      notes: notes.trim(),
      updatedAt: Date.now()
    };

    await onSave(newLog);
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Очистить запись за этот день?')) {
      setIsSaving(true);
      await onDelete(dateStr);
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-blush-100">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blush-50/50 to-white">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-blush-600">
              Запись за день
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 capitalize">
              {formatReadableDate(dateStr, 'EEEE, d MMMM')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="bg-blush-50/50 rounded-2xl p-3.5 border border-blush-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Droplet className="w-4 h-4 text-blush-500 fill-blush-500" />
                <span>Выделения / Месячные</span>
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {FLOW_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFlowSelect(item.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                    flow === item.id
                      ? 'bg-blush-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:border-blush-300'
                  }`}
                >
                  <span className="text-[10px] opacity-80 mb-0.5">
                    {item.drops === 0 ? '✕' : '💧'.repeat(item.drops)}
                  </span>
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Самочувствие и симптомы
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_OPTIONS.map((sym) => {
                const active = symptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
                      active
                        ? 'bg-blush-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200/70 hover:bg-blush-50'
                    }`}
                  >
                    <span>{sym.icon}</span>
                    <span>{sym.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Настроение
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_OPTIONS.map((m) => {
                const active = moods.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMood(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
                      active
                        ? 'bg-peach-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200/70 hover:bg-peach-50'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Сексуальная активность
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SEX_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSex(item.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                    sex === item.id
                      ? 'bg-rosewood-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200/70 hover:bg-rosewood-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Заметки или мысли
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Как прошел день, выпила витамины, тренировка..."
              className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400 focus:border-transparent placeholder:text-slate-400 resize-none bg-slate-50/50"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center space-x-2.5 pb-safe bg-slate-50/60">
          {initialLog && (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="p-3 rounded-2xl text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors"
              title="Удалить запись"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blush-500 to-blush-600 text-white font-semibold text-sm shadow-soft hover:brightness-105 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
