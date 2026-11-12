import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  subDays
} from 'date-fns';
import { ru } from 'date-fns/locale';
import type { CyclePhase, CycleStats, DayLog, PeriodCycle, UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lutealPhaseLength: 14,
  displayName: 'Любимая'
};

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatReadableDate(dateStr: string, formatStr = 'd MMMM yyyy'): string {
  try {
    return format(parseISO(dateStr), formatStr, { locale: ru });
  } catch {
    return dateStr;
  }
}

export function calculateAverages(
  cycles: PeriodCycle[],
  settings: UserSettings
): { avgCycleLength: number; avgPeriodLength: number } {
  if (!cycles || cycles.length === 0) {
    return {
      avgCycleLength: settings.averageCycleLength,
      avgPeriodLength: settings.averagePeriodLength
    };
  }

  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const periodLengths: number[] = [];
  for (const c of sorted) {
    if (c.endDate && c.startDate) {
      const dur = differenceInDays(parseISO(c.endDate), parseISO(c.startDate)) + 1;
      if (dur >= 2 && dur <= 12) {
        periodLengths.push(dur);
      }
    }
  }

  const cycleLengths: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = differenceInDays(
      parseISO(sorted[i + 1].startDate),
      parseISO(sorted[i].startDate)
    );
    if (diff >= 20 && diff <= 45) {
      cycleLengths.push(diff);
    }
  }

  const avgPeriodLength =
    periodLengths.length > 0
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : settings.averagePeriodLength;

  const avgCycleLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : settings.averageCycleLength;

  return { avgCycleLength, avgPeriodLength };
}

export function computeCycleStats(
  cycles: PeriodCycle[],
  settings: UserSettings = DEFAULT_SETTINGS,
  referenceDate: Date = new Date()
): CycleStats {
  const { avgCycleLength, avgPeriodLength } = calculateAverages(cycles, settings);
  const today = startOfDay(referenceDate);

  if (!cycles || cycles.length === 0) {
    const nextDate = addDays(today, 14);
    const ovDate = addDays(today, 0);
    return {
      currentCycleDay: 14,
      currentPhase: 'ovulation',
      phaseTitle: 'Овуляция',
      phaseDescription: 'Пик фертильности и энергии. Отметь первый день цикла, чтобы настроить календарь.',
      daysUntilNextPeriod: 14,
      nextPeriodDate: formatDateKey(nextDate),
      ovulationDate: formatDateKey(ovDate),
      fertileWindowStart: formatDateKey(subDays(ovDate, 4)),
      fertileWindowEnd: formatDateKey(addDays(ovDate, 1)),
      pregnancyChance: 'Пик овуляции',
      avgCycleLength,
      avgPeriodLength,
      isDelay: false,
      delayDays: 0
    };
  }

  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const latest = sorted[0];
  const lastStart = startOfDay(parseISO(latest.startDate));

  const currentCycleDay = Math.max(1, differenceInDays(today, lastStart) + 1);
  const nextPeriod = addDays(lastStart, avgCycleLength);
  const daysUntilNext = differenceInDays(nextPeriod, today);

  const isDelay = daysUntilNext < 0;
  const delayDays = isDelay ? Math.abs(daysUntilNext) : 0;

  const ovulation = subDays(nextPeriod, settings.lutealPhaseLength || 14);
  const fertileStart = subDays(ovulation, 5);
  const fertileEnd = addDays(ovulation, 1);

  let currentPhase: CyclePhase = 'follicular';
  let phaseTitle = 'Фолликулярная фаза';
  let phaseDescription = 'Уровень энергии и настроения растет. Организм готовится к овуляции.';
  let pregnancyChance: CycleStats['pregnancyChance'] = 'Низкая';

  const periodEnd = latest.endDate
    ? startOfDay(parseISO(latest.endDate))
    : addDays(lastStart, avgPeriodLength - 1);

  if ((isSameDay(today, lastStart) || isAfter(today, lastStart)) && (isSameDay(today, periodEnd) || isBefore(today, periodEnd))) {
    currentPhase = 'menstrual';
    phaseTitle = 'Менструация';
    phaseDescription = 'Время замедлиться, окружить себя теплом, уютом и заботой.';
    pregnancyChance = 'Низкая';
  } else if (
    (isSameDay(today, fertileStart) || isAfter(today, fertileStart)) &&
    (isSameDay(today, fertileEnd) || isBefore(today, fertileEnd))
  ) {
    currentPhase = 'ovulation';
    if (isSameDay(today, ovulation)) {
      phaseTitle = 'День овуляции';
      phaseDescription = 'Пик фертильности! Максимальная вероятность зачатия и всплеск энергии.';
      pregnancyChance = 'Пик овуляции';
    } else {
      phaseTitle = 'Окно фертильности';
      phaseDescription = 'Высокая вероятность зачатия. Прекрасное самочувствие и сияние.';
      pregnancyChance = 'Высокая';
    }
  } else if (isAfter(today, fertileEnd)) {
    currentPhase = 'luteal';
    phaseTitle = 'Лютеиновая фаза';
    phaseDescription = 'Вторая половина цикла. Организму может требоваться больше отдыха и нежности.';
    pregnancyChance = 'Низкая';
  } else {
    currentPhase = 'follicular';
    phaseTitle = 'Фолликулярная фаза';
    phaseDescription = 'Фаза возрождения и активности. Отличное время для планов и тренировок.';
    pregnancyChance = 'Средняя';
  }

  return {
    currentCycleDay,
    currentPhase,
    phaseTitle,
    phaseDescription,
    daysUntilNextPeriod: Math.max(0, daysUntilNext),
    nextPeriodDate: formatDateKey(nextPeriod),
    ovulationDate: formatDateKey(ovulation),
    fertileWindowStart: formatDateKey(fertileStart),
    fertileWindowEnd: formatDateKey(fertileEnd),
    pregnancyChance,
    avgCycleLength,
    avgPeriodLength,
    isDelay,
    delayDays
  };
}

export function getCalendarDayInfo(
  date: Date,
  cycles: PeriodCycle[],
  dayLogs: Record<string, DayLog>,
  stats: CycleStats
) {
  const dateKey = formatDateKey(date);
  const log = dayLogs[dateKey];
  const dayStart = startOfDay(date);

  let isPeriod = log?.isPeriod || false;
  if (!isPeriod) {
    for (const c of cycles) {
      const cStart = startOfDay(parseISO(c.startDate));
      const cEnd = c.endDate
        ? startOfDay(parseISO(c.endDate))
        : addDays(cStart, stats.avgPeriodLength - 1);
      
      if ((isSameDay(dayStart, cStart) || isAfter(dayStart, cStart)) &&
          (isSameDay(dayStart, cEnd) || isBefore(dayStart, cEnd))) {
        isPeriod = true;
        break;
      }
    }
  }

  let isPredictedPeriod = false;
  if (!isPeriod && stats.nextPeriodDate) {
    const nextStart = startOfDay(parseISO(stats.nextPeriodDate));
    const nextEnd = addDays(nextStart, stats.avgPeriodLength - 1);
    
    if ((isSameDay(dayStart, nextStart) || isAfter(dayStart, nextStart)) &&
        (isSameDay(dayStart, nextEnd) || isBefore(dayStart, nextEnd))) {
      isPredictedPeriod = true;
    }

    const future2Start = addDays(nextStart, stats.avgCycleLength);
    const future2End = addDays(future2Start, stats.avgPeriodLength - 1);
    if ((isSameDay(dayStart, future2Start) || isAfter(dayStart, future2Start)) &&
        (isSameDay(dayStart, future2End) || isBefore(dayStart, future2End))) {
      isPredictedPeriod = true;
    }
  }

  const isOvulation = stats.ovulationDate === dateKey;
  
  let isFertile = false;
  if (stats.fertileWindowStart && stats.fertileWindowEnd) {
    const fStart = startOfDay(parseISO(stats.fertileWindowStart));
    const fEnd = startOfDay(parseISO(stats.fertileWindowEnd));
    if ((isSameDay(dayStart, fStart) || isAfter(dayStart, fStart)) &&
        (isSameDay(dayStart, fEnd) || isBefore(dayStart, fEnd))) {
      isFertile = true;
    }
  }

  const hasNotes = Boolean(log?.notes && log.notes.trim().length > 0);
  const hasSymptoms = Boolean(log?.symptoms && log.symptoms.length > 0);
  const hasMoods = Boolean(log?.moods && log.moods.length > 0);
  const hasSex = Boolean(log?.sexActivity && log.sexActivity !== 'none');

  return {
    isPeriod,
    isPredictedPeriod,
    isOvulation,
    isFertile,
    hasLog: hasNotes || hasSymptoms || hasMoods || hasSex,
    flowIntensity: log?.flowIntensity,
    log
  };
}
