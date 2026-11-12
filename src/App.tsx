import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { Header } from './components/Header';
import { DailyCard } from './components/DailyCard';
import { CycleRing } from './components/CycleRing';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { DayLogModal } from './components/DayLogModal';
import { SettingsModal } from './components/SettingsModal';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { BottomNav } from './components/BottomNav';
import type { NavTab } from './components/BottomNav';
import type { DayLog, PeriodCycle, UserSettings } from './types';
import {
  DEFAULT_SETTINGS,
  computeCycleStats,
  formatDateKey
} from './utils/cycleCalculations';
import {
  subscribeToUserData,
  saveCycle,
  deleteCycle,
  saveDayLog,
  deleteDayLog,
  saveSettings
} from './lib/storage';
import type { AppData } from './lib/storage';
import {
  subscribeToAuth,
  checkRedirectAuth
} from './lib/firebase';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // App data state
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [dayLogs, setDayLogs] = useState<Record<string, DayLog>>({});
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);

  // Check redirect auth on load (for mobile Safari)
  useEffect(() => {
    checkRedirectAuth().then((redirectUser) => {
      if (redirectUser) {
        setUser(redirectUser);
      }
    });

    const unsubAuth = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to user data (Firestore or Guest fallback)
  useEffect(() => {
    const unsubData = subscribeToUserData(
      user ? user.uid : '',
      (data) => {
        setCycles(data.cycles);
        setDayLogs(data.dayLogs);
        setSettings(data.settings);
      },
      (err) => {
        console.warn('Subscription error, using local fallback', err);
      }
    );

    return () => unsubData();
  }, [user]);

  const appData: AppData = {
    cycles,
    dayLogs,
    settings
  };

  const todayStr = formatDateKey(new Date());
  const stats = computeCycleStats(cycles, settings);

  // Check if today is during an active period
  const sortedCycles = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const latestCycle = sortedCycles[0];

  const isTodayMarkedPeriod = Boolean(dayLogs[todayStr]?.isPeriod);
  const isOngoingCycle = Boolean(
    latestCycle && (!latestCycle.endDate || latestCycle.isOngoing)
  );

  const isPeriodActive = isTodayMarkedPeriod || isOngoingCycle;

  // Handler: Quick toggle period
  const handleTogglePeriod = async () => {
    const userId = user ? user.uid : null;

    if (isPeriodActive) {
      // Ending period
      if (latestCycle) {
        const dur =
          differenceInDays(
            startOfDay(parseISO(todayStr)),
            startOfDay(parseISO(latestCycle.startDate))
          ) + 1;

        await saveCycle(userId, {
          ...latestCycle,
          endDate: todayStr,
          durationDays: Math.max(1, dur),
          isOngoing: false
        });
      }
    } else {
      // Starting new period
      const newCycleId = `cycle_${Date.now()}`;
      const newCycle: PeriodCycle = {
        id: newCycleId,
        startDate: todayStr,
        isOngoing: true
      };

      await saveCycle(userId, newCycle);

      // Also mark today's log as period
      await saveDayLog(userId, {
        date: todayStr,
        isPeriod: true,
        flowIntensity: 'medium',
        symptoms: dayLogs[todayStr]?.symptoms || [],
        moods: dayLogs[todayStr]?.moods || [],
        sexActivity: dayLogs[todayStr]?.sexActivity || 'none',
        notes: dayLogs[todayStr]?.notes || '',
        updatedAt: Date.now()
      });
    }
  };

  // Handler: Save day log
  const handleSaveDayLog = async (log: DayLog) => {
    const userId = user ? user.uid : null;
    await saveDayLog(userId, log);

    // If marked as period and no cycle exists for this date, optionally create or attach
    if (log.isPeriod) {
      const existingCycle = cycles.find((c) => c.startDate === log.date);
      if (!existingCycle) {
        const sorted = [...cycles].sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        const last = sorted[0];
        if (!last || differenceInDays(parseISO(log.date), parseISO(last.startDate)) > 15) {
          await saveCycle(userId, {
            id: `cycle_${Date.now()}`,
            startDate: log.date,
            isOngoing: true
          });
        }
      }
    }
  };

  // Handler: Delete day log
  const handleDeleteDayLog = async (dateStr: string) => {
    const userId = user ? user.uid : null;
    await deleteDayLog(userId, dateStr);
  };

  // Handler: Manual add cycle
  const handleAddCycle = async (startDate: string, endDate?: string) => {
    const userId = user ? user.uid : null;
    let durationDays: number | undefined;
    if (endDate) {
      durationDays = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    }

    const newCycle: PeriodCycle = {
      id: `cycle_${Date.now()}`,
      startDate,
      endDate: endDate || undefined,
      durationDays,
      isOngoing: !endDate
    };

    await saveCycle(userId, newCycle);
  };

  // Handler: Delete cycle
  const handleDeleteCycle = async (cycleId: string) => {
    const userId = user ? user.uid : null;
    await deleteCycle(userId, cycleId);
  };

  // Handler: Update settings
  const handleUpdateSettings = async (newSettings: UserSettings) => {
    const userId = user ? user.uid : null;
    await saveSettings(userId, newSettings);
  };

  return (
    <div className="min-h-screen bg-[#FAF5F5] flex flex-col font-sans pb-safe-nav">
      {/* App Header */}
      <Header
        user={user}
        isGuest={!user}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fade-in">
            {/* Daily Affirmation & Compliment Card */}
            <DailyCard currentPhase={stats.currentPhase} />

            {/* Hero Cycle Ring Widget */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-blush-200/80 shadow-soft">
              <CycleRing
                stats={stats}
                isPeriodActive={isPeriodActive}
                onTogglePeriod={handleTogglePeriod}
                onOpenCalendar={() => setActiveTab('calendar')}
              />
            </div>

            {/* Quick action: Today's symptom log shortcut */}
            <button
              onClick={() => setSelectedDateStr(todayStr)}
              className="w-full py-3.5 px-4 rounded-2xl bg-white border border-blush-200/80 hover:border-blush-300 shadow-soft flex items-center justify-between text-left active:scale-98 transition-all"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">✍️</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    Как ты себя чувствуешь сегодня?
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Отметь симптомы, настроение и ощущения
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blush-600 bg-blush-50 px-2.5 py-1 rounded-xl">
                Записать
              </span>
            </button>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4 animate-fade-in">
            <CalendarView
              cycles={cycles}
              dayLogs={dayLogs}
              stats={stats}
              onSelectDate={(date) => setSelectedDateStr(date)}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-fade-in">
            <AnalyticsView
              cycles={cycles}
              stats={stats}
              onAddCycle={handleAddCycle}
              onDeleteCycle={handleDeleteCycle}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-5 border border-blush-200 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-800">Быстрые действия</h3>
              
              <button
                onClick={() => setShowSettingsModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-blush-50 text-blush-700 font-semibold text-xs flex items-center justify-between hover:bg-blush-100 transition-colors"
              >
                <span>Все параметры и резервные копии</span>
                <span>→</span>
              </button>

              <button
                onClick={() => setShowFirebaseGuide(true)}
                className="w-full py-3 px-4 rounded-2xl bg-orange-50 text-orange-700 font-semibold text-xs flex items-center justify-between hover:bg-orange-100 transition-colors"
              >
                <span>Инструкция по настройке Firebase</span>
                <span>→</span>
              </button>

              <button
                onClick={() => setShowFirebaseConfig(true)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-between hover:bg-slate-200 transition-colors"
              >
                <span>Ввести API ключи Firebase</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Day Log Detail Modal */}
      {selectedDateStr && (
        <DayLogModal
          dateStr={selectedDateStr}
          initialLog={dayLogs[selectedDateStr]}
          onClose={() => setSelectedDateStr(null)}
          onSave={handleSaveDayLog}
          onDelete={handleDeleteDayLog}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          user={user}
          settings={settings}
          appData={appData}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
          onOpenFirebaseGuide={() => {
            setShowSettingsModal(false);
            setShowFirebaseGuide(true);
          }}
          onOpenFirebaseConfig={() => {
            setShowSettingsModal(false);
            setShowFirebaseConfig(true);
          }}
        />
      )}

      {/* Firebase Guide Modal */}
      {showFirebaseGuide && (
        <FirebaseGuideModal onClose={() => setShowFirebaseGuide(false)} />
      )}

      {/* Firebase Config Modal */}
      {showFirebaseConfig && (
        <FirebaseConfigModal onClose={() => setShowFirebaseConfig(false)} />
      )}
    </div>
  );
};

export default App;
