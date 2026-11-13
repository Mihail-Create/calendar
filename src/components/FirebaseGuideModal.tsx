import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Flame } from 'lucide-react';

interface FirebaseGuideModalProps {
  onClose: () => void;
}

export const FIRESTORE_SECURITY_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Полная защита данных: доступ разрешен ТОЛЬКО владельцу учетной записи
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ onClose }) => {
  const [copiedRules, setCopiedRules] = useState(false);

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_SECURITY_RULES);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-blush-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-blush-50 to-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Пошаговый гайд по Firebase
              </h3>
              <p className="text-[11px] text-slate-500">Бесплатное и вечное хранение данных</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-blush-500 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Создайте проект в Firebase Console</span>
            </div>
            <p className="pl-7 text-slate-600">
              Перейдите на{' '}
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-blush-600 font-semibold underline inline-flex items-center space-x-1"
              >
                <span>console.firebase.google.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              , нажмите <strong>«Add project»</strong> (Добавить проект), введите имя (например, <code>eva-calendar</code>) и завершите создание (Google Analytics можно отключить).
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-blush-500 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Включите вход через Google (Authentication)</span>
            </div>
            <p className="pl-7 text-slate-600">
              В меню слева выберите <strong>Build → Authentication</strong> → <strong>Get Started</strong>. Во вкладке <strong>Sign-in method</strong> выберите <strong>Google</strong>, нажмите <strong>Enable</strong>, укажите свой email поддержки и нажмите <strong>Save</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-blush-500 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Создайте базу Cloud Firestore</span>
            </div>
            <p className="pl-7 text-slate-600">
              В меню слева выберите <strong>Build → Firestore Database</strong> → <strong>Create database</strong>. Выберите ближайший регион (например, <code>europe-west</code> или <code>us-central</code>) и нажмите <strong>Create</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-blush-500 text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>Настройте строгую защиту данных (Rules)</span>
            </div>
            <p className="pl-7 text-slate-600">
              В Firestore откройте вкладку <strong>Rules</strong> (Правила), сотрите всё что там есть и вставьте следующий код (он гарантирует, что <strong>только ваша жена</strong> видит свои записи):
            </p>

            <div className="ml-7 relative bg-slate-900 text-slate-200 p-3 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800">
              <button
                onClick={handleCopyRules}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-sans text-[10px] flex items-center space-x-1 transition-all"
              >
                {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRules ? 'Скопировано!' : 'Копировать'}</span>
              </button>
              <pre className="pr-16">{FIRESTORE_SECURITY_RULES}</pre>
            </div>
            <p className="pl-7 text-slate-500 text-[11px]">Нажмите кнопку <strong>Publish</strong>.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-blush-500 text-white flex items-center justify-center text-xs">
                5
              </span>
              <span>Скопируйте ключи Web App</span>
            </div>
            <p className="pl-7 text-slate-600">
              Нажмите на шестерёнку вверху ⚙️ <strong>Project settings</strong> → прокрутите вниз до <strong>Your apps</strong> → выберите иконку веб <strong>&lt;/&gt;</strong> (Web) → зарегистрируйте приложение (например, <code>Eva Web</code>). Скопируйте объект <code>firebaseConfig</code> и вставьте в настройках приложения или в файл <code>.env</code>.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-soft"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
