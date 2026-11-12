import React from 'react';
import { Cloud, CloudOff, Heart } from 'lucide-react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onOpenSettings: () => void;
  isGuest: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF5F5]/90 backdrop-blur-md border-b border-blush-100 px-4 py-3 pt-safe transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blush-400 to-blush-600 flex items-center justify-center shadow-sm text-white">
            <Heart className="w-5 h-5 fill-white/30" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-slate-800 tracking-tight">Ева</span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-blush-100 text-blush-700">
                Мой ритм
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Календарь твоего цикла</p>
          </div>
        </div>

        {/* Status & Profile / Settings trigger */}
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-full bg-white border border-blush-200 shadow-xs hover:border-blush-300 transition-all active:scale-95"
          title="Открыть настройки"
        >
          {user ? (
            <>
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Пользователь'}
                    className="w-6 h-6 rounded-full object-cover border border-blush-200"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blush-100 text-blush-600 font-semibold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'Я')[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              </div>
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-rosewood-100 text-rosewood-600 flex items-center justify-center">
                <CloudOff className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-600">Гость</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
