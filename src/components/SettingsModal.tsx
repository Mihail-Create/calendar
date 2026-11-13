import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  LogIn,
  LogOut,
  Download,
  Upload,
  Sliders,
  ShieldCheck,
  Flame,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { UserSettings } from '../types';
import type { AppData } from '../lib/storage';
import { exportDataAsJSON, importDataFromJSON } from '../lib/storage';
import { loginWithGoogle, logoutUser, isFirebaseConfigured } from '../lib/firebase';

interface SettingsModalProps {
  user: User | null;
  settings: UserSettings;
  appData: AppData;
  onUpdateSettings: (newSettings: UserSettings) => Promise<void>;
  onClose: () => void;
  onOpenFirebaseGuide: () => void;
  onOpenFirebaseConfig: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  settings,
  appData,
  onUpdateSettings,
  onClose,
  onOpenFirebaseGuide,
  onOpenFirebaseConfig
}) => {
  const [cycleLength, setCycleLength] = useState(settings.averageCycleLength || 28);
  const [periodLength, setPeriodLength] = useState(settings.averagePeriodLength || 5);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const configured = isFirebaseConfigured();

  const handleSaveParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateSettings({
      ...settings,
      averageCycleLength: Number(cycleLength),
      averagePeriodLength: Number(periodLength)
    });
    setIsSaving(false);
    setStatusMsg({ text: 'Настройки сохранены!' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleGoogleLogin = async () => {
    try {
      setStatusMsg(null);
      await loginWithGoogle();
      setStatusMsg({ text: 'Успешный вход в Google!' });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        text: err.message || 'Ошибка входа через Google',
        error: true
      });
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Выйти из учетной записи?')) {
      await logoutUser();
      onClose();
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const res = await importDataFromJSON(user ? user.uid : null, content);
      setStatusMsg({
        text: res.message,
        error: !res.success
      });
      if (res.success) {
        setTimeout(() => window.location.reload(), 1500);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-blush-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blush-50/50 to-white">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blush-600" />
            <h3 className="text-base font-bold text-slate-800">Настройки</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {statusMsg && (
            <div
              className={`p-3 rounded-2xl flex items-center space-x-2 ${
                statusMsg.error
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {statusMsg.error ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium">{statusMsg.text}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blush-600" />
                <span>Учётная запись Google</span>
              </span>
              {configured ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Firebase подключен
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Локальный режим
                </span>
              )}
            </div>

            {user ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || ''}
                      className="w-10 h-10 rounded-full border border-blush-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blush-100 text-blush-600 flex items-center justify-center font-bold">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <strong className="block text-slate-800 text-sm">
                      {user.displayName || 'Пользователь'}
                    </strong>
                    <span className="text-slate-400 text-xs">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Войдите через Google, чтобы ваши данные автоматически и надёжно сохранялись в защищенном облаке и никогда не терялись при смене телефона.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold flex items-center justify-center space-x-2 shadow-sm transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Войти через Google</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenFirebaseGuide}
              className="p-3 rounded-2xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/70 text-left transition-colors"
            >
              <div className="flex items-center space-x-1.5 text-orange-700 font-bold mb-0.5">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>Гайд Firebase</span>
              </div>
              <p className="text-[10px] text-slate-500">Пошаговая инструкция</p>
            </button>

            <button
              onClick={onOpenFirebaseConfig}
              className="p-3 rounded-2xl bg-blush-50/70 hover:bg-blush-100/70 border border-blush-200/70 text-left transition-colors"
            >
              <div className="flex items-center space-x-1.5 text-blush-700 font-bold mb-0.5">
                <Key className="w-4 h-4 text-blush-600" />
                <span>Ключи API</span>
              </div>
              <p className="text-[10px] text-slate-500">Настройка подключения</p>
            </button>
          </div>

          <form onSubmit={handleSaveParameters} className="space-y-3 pt-1">
            <h4 className="font-bold text-slate-800 text-sm">Параметры цикла</h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Средний цикл (дней)
                </label>
                <input
                  type="number"
                  min="20"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blush-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Длительность месячных
                </label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blush-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors"
            >
              {isSaving ? 'Сохранение...' : 'Обновить параметры'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Резервная копия данных</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Вы в любой момент можете скачать все свои данные в один JSON-файл и сохранить его себе на телефон или в заметки.
            </p>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => exportDataAsJSON(appData)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-blush-200 hover:bg-blush-50 text-blush-700 font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать копию (.json)</span>
              </button>

              <label className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Восстановить</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileImport}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
