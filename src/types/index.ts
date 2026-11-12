export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type SymptomType = 
  | 'cramps' // спазмы внизу живота
  | 'headache' // головная боль
  | 'bloating' // вздутие
  | 'tender_breasts' // чувствительность груди
  | 'fatigue' // усталость
  | 'backache' // боль в пояснице
  | 'acne' // высыпания
  | 'nausea' // тошнота
  | 'insomnia' // бессонница
  | 'cravings'; // тяга к сладкому

export type MoodType = 
  | 'happy' // радостное
  | 'calm' // спокойное
  | 'energetic' // прилив энергии
  | 'sensitive' // чувствительное / ранимое
  | 'irritated' // раздражительное
  | 'anxious' // тревожное
  | 'sad' // грустное
  | 'romantic'; // романтичное

export type SexActivity = 'none' | 'protected' | 'unprotected' | 'high_libido';

export interface DayLog {
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flowIntensity?: FlowIntensity;
  symptoms: SymptomType[];
  moods: MoodType[];
  sexActivity?: SexActivity;
  temperature?: number;
  notes?: string;
  updatedAt: number;
}

export interface PeriodCycle {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  durationDays?: number; // length of period in days
  cycleLength?: number; // days from this start to next start
  isOngoing?: boolean;
}

export interface UserSettings {
  displayName?: string;
  averageCycleLength: number; // e.g. 28
  averagePeriodLength: number; // e.g. 5
  lutealPhaseLength: number; // e.g. 14
}

export type CyclePhase = 
  | 'menstrual' // Менструация
  | 'follicular' // Фолликулярная фаза
  | 'ovulation' // Овуляция / Пик фертильности
  | 'luteal'; // Лютеиновая фаза (ПМС)

export interface CycleStats {
  currentCycleDay: number;
  currentPhase: CyclePhase;
  phaseTitle: string;
  phaseDescription: string;
  daysUntilNextPeriod: number;
  nextPeriodDate: string; // YYYY-MM-DD
  ovulationDate: string; // YYYY-MM-DD
  fertileWindowStart: string; // YYYY-MM-DD
  fertileWindowEnd: string; // YYYY-MM-DD
  pregnancyChance: 'Низкая' | 'Средняя' | 'Высокая' | 'Пик овуляции';
  avgCycleLength: number;
  avgPeriodLength: number;
  isDelay: boolean;
  delayDays: number;
}
