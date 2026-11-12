import React, { useState } from 'react';
import { X, Save, Trash2, Key } from 'lucide-react';
import type { FirebaseConfigType } from '../lib/firebase';
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  removeStoredFirebaseConfig
} from '../lib/firebase';

interface FirebaseConfigModalProps {
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ onClose }) => {
  const currentConfig = getStoredFirebaseConfig();

  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');
  const [rawJson, setRawJson] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleParseJson = () => {
    try {
      setError(null);
      let clean = rawJson.trim();
      if (clean.includes('{') && clean.includes('}')) {
        clean = clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1);
      }
      
      clean = clean
        .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}');

      const parsed = JSON.parse(clean);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setRawJson('');
    } catch {
      setError('Не удалось разобрать вставленный фрагмент. Проверьте формат или заполните поля вручную.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setError('Пожалуйста, заполните как минимум API Key и Project ID');
      return;
    }

    const newConfig: FirebaseConfigType = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    saveStoredFirebaseConfig(newConfig);
  };

  const handleReset = () => {
    if (window.confirm('Сбросить текущие ключи Firebase?')) {
      removeStoredFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-blush-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-blush-50 to-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Key className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Подключение Firebase
              </h3>
              <p className="text-[11px] text-slate-500">Ключи вашего проекта Google</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Быстрая вставка объекта firebaseConfig
            </label>
            <textarea
              rows={2}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder="const firebaseConfig = { apiKey: '...', projectId: '...' };"
              className="w-full p-2 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blush-400"
            />
            {rawJson.trim() && (
              <button
                type="button"
                onClick={handleParseJson}
                className="mt-2 text-xs font-semibold text-blush-600 hover:text-blush-700 underline"
              >
                Разобрать и заполнить поля ↓
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">API Key *</label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blush-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project ID *</label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="eva-calendar-12345"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blush-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="eva-calendar-12345.firebaseapp.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blush-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456789:web:abcdef"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blush-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            💡 Ключи сохраняются в защищенном хранилище приложения на вашем устройстве.
          </p>

          <div className="pt-2 flex items-center space-x-2">
            {currentConfig && (
              <button
                type="button"
                onClick={handleReset}
                className="p-3 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                title="Сбросить ключи"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blush-500 to-blush-600 text-white font-semibold text-xs shadow-soft hover:brightness-105 transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить и подключиться</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
